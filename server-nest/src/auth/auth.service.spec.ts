import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Stage 3 (auth) unit tests, written before the implementation exists --
// see docs/nestjs-migration-spec.md ("Auth flow", "Refresh token
// revocation"). PrismaService is mocked (this is unit-level, not an
// integration test against real Postgres -- schema-level correctness is
// already covered by src/prisma/schema.spec.ts). JwtService is real
// (registered via JwtModule), so the tokens these tests assert on are
// genuinely signed and verifiable, not just "was sign() called".

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findFirst: jest.Mock; create: jest.Mock };
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let jwtService: JwtService;

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), create: jest.fn() },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [AuthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  describe('issueTokenPair', () => {
    it('returns a real, verifiable access token with a ~15 minute expiry', async () => {
      prisma.refreshToken.create.mockResolvedValue({
        id: 'rt-1',
        tokenHash: 'hash',
      });

      const { accessToken } = await service.issueTokenPair('user-1');
      const payload = jwtService.verify<{
        sub: string;
        iat: number;
        exp: number;
      }>(accessToken);

      expect(payload.sub).toBe('user-1');
      expect(payload.exp - payload.iat).toBeGreaterThanOrEqual(14 * 60);
      expect(payload.exp - payload.iat).toBeLessThanOrEqual(16 * 60);
    });

    it('persists a hash of the refresh token, never the raw value', async () => {
      prisma.refreshToken.create.mockResolvedValue({
        id: 'rt-1',
        tokenHash: 'hash',
      });

      const { refreshToken } = await service.issueTokenPair('user-1');

      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
      const createArgs = prisma.refreshToken.create.mock.calls[0][0] as {
        data: { userId: string; tokenHash: string };
      };
      expect(createArgs.data.userId).toBe('user-1');
      expect(createArgs.data.tokenHash).not.toBe(refreshToken);
      expect(createArgs.data.tokenHash.length).toBeGreaterThan(0);
    });
  });

  describe('refreshTokens', () => {
    it('rotates: issues a new pair and marks the old token used', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        issuedAt: new Date(),
        usedAt: null,
        revokedAt: null,
      });
      prisma.refreshToken.update.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({
        id: 'rt-2',
        tokenHash: 'new-hash',
      });

      const result = await service.refreshTokens('raw-refresh-token');

      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: expect.objectContaining({ usedAt: expect.any(Date) }),
        }),
      );
    });

    it('rejects an unknown refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('bogus')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a revoked refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        issuedAt: new Date(),
        usedAt: null,
        revokedAt: new Date(),
      });

      await expect(service.refreshTokens('raw')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a refresh token older than 30 days', async () => {
      const issuedAt = new Date();
      issuedAt.setDate(issuedAt.getDate() - 31);
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        issuedAt,
        usedAt: null,
        revokedAt: null,
      });

      await expect(service.refreshTokens('raw')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('treats a replayed (already-used) refresh token as a compromise signal and revokes every token for that user', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        issuedAt: new Date(),
        usedAt: new Date(), // already rotated away once before -- this is a replay
        revokedAt: null,
      });
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      await expect(service.refreshTokens('raw')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', revokedAt: null },
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('marks the matching token revoked', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({ id: 'rt-1' });
      prisma.refreshToken.update.mockResolvedValue({});

      await service.revokeRefreshToken('raw-refresh-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });

    it('rejects an unknown refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.revokeRefreshToken('bogus')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });
  });

  describe('revokeAllRefreshTokensForUser', () => {
    it('revokes every non-revoked token for the user', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 2 });

      await service.revokeAllRefreshTokensForUser('user-1');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revokedAt: null },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      });
    });
  });

  describe('findOrCreateOAuthUser', () => {
    it('returns the existing user when the provider id already matches one', async () => {
      const existing = { id: 'user-1', googleId: 'g-1', displayName: 'Ada' };
      prisma.user.findFirst.mockResolvedValue(existing);

      const user = await service.findOrCreateOAuthUser({
        provider: 'google',
        profileId: 'g-1',
        displayName: 'Ada (new name from Google)',
      });

      expect(user).toBe(existing);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('creates a new user when no provider id matches', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-2',
        githubId: 'gh-1',
        displayName: 'Grace',
      });

      const user = await service.findOrCreateOAuthUser({
        provider: 'github',
        profileId: 'gh-1',
        displayName: 'Grace',
      });

      expect(user.id).toBe('user-2');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { githubId: 'gh-1', displayName: 'Grace' },
      });
    });
  });
});
