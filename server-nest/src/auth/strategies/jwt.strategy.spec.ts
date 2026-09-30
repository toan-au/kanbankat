import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

// Only the payload -> req.user mapping is tested here; token
// extraction/signature verification is passport-jwt's own, already-tested
// responsibility, not ours to re-test.
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    prisma = { user: { findUnique: jest.fn() } };
    strategy = new JwtStrategy(prisma as unknown as PrismaService);
  });

  it('returns the user matching the token payload subject', async () => {
    const user = { id: 'user-1', displayName: 'Ada' };
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await strategy.validate({ sub: 'user-1' });

    expect(result).toBe(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
  });

  it('throws UnauthorizedException when the token subject no longer matches a real user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'deleted-user' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
