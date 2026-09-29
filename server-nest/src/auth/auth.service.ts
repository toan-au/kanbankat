import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface OAuthUserInput {
  provider: 'google' | 'github';
  profileId: string;
  displayName: string;
}

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, see docs/nestjs-migration-spec.md ("JWT shape")

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async issueTokenPair(userId: string): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshToken = this.generateRawToken();
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: this.hashToken(refreshToken) },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(rawRefreshToken: string): Promise<TokenPair> {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(rawRefreshToken) },
    });

    if (!existing) {
      throw new UnauthorizedException();
    }
    if (existing.revokedAt) {
      throw new UnauthorizedException();
    }
    if (Date.now() - existing.issuedAt.getTime() > REFRESH_TOKEN_TTL_MS) {
      throw new UnauthorizedException();
    }
    if (existing.usedAt) {
      // Replay of an already-rotated-away token: someone else has a copy of
      // it. Revoke the whole family rather than just this one token -- see
      // docs/nestjs-migration-spec.md ("Refresh token revocation").
      await this.revokeAllRefreshTokensForUser(existing.userId);
      throw new UnauthorizedException();
    }

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { usedAt: new Date() },
    });

    return this.issueTokenPair(existing.userId);
  }

  async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { tokenHash: this.hashToken(rawRefreshToken) },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async findOrCreateOAuthUser({
    provider,
    profileId,
    displayName,
  }: OAuthUserInput): Promise<User> {
    const idField = provider === 'google' ? 'googleId' : 'githubId';

    const existing = await this.prisma.user.findFirst({
      where: { [idField]: profileId },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.user.create({
      data: { [idField]: profileId, displayName },
    });
  }

  private generateRawToken(): string {
    return randomBytes(64).toString('hex');
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
