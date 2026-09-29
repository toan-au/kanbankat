import { Injectable, NotImplementedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
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

// Skeleton only -- see auth.service.spec.ts for the intended behavior of
// each method. Every method rejects until implemented; this exists so the
// spec file's imports resolve to real types (fixing the tsc/eslint noise
// from red-only tests) without pretending the logic exists yet. Not async
// (no await inside), just returns an already-rejected Promise -- same
// externally-observable behavior for callers/`.rejects.toThrow()`, but
// satisfies @typescript-eslint/require-await.
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  issueTokenPair(_userId: string): Promise<TokenPair> {
    return Promise.reject(new NotImplementedException());
  }

  refreshTokens(_rawRefreshToken: string): Promise<TokenPair> {
    return Promise.reject(new NotImplementedException());
  }

  revokeRefreshToken(_rawRefreshToken: string): Promise<void> {
    return Promise.reject(new NotImplementedException());
  }

  revokeAllRefreshTokensForUser(_userId: string): Promise<void> {
    return Promise.reject(new NotImplementedException());
  }

  findOrCreateOAuthUser(_input: OAuthUserInput): Promise<User> {
    return Promise.reject(new NotImplementedException());
  }
}
