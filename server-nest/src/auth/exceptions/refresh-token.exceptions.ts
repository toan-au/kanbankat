import { UnauthorizedException } from '@nestjs/common';

export class InvalidRefreshTokenException extends UnauthorizedException {
  readonly errorCode = 'AUTH_INVALID_REFRESH_TOKEN';

  constructor() {
    super('Refresh token is invalid or does not exist.');
  }
}

export class RefreshTokenRevokedException extends UnauthorizedException {
  readonly errorCode = 'AUTH_REFRESH_TOKEN_REVOKED';

  constructor() {
    super('Refresh token has been revoked.');
  }
}

export class RefreshTokenExpiredException extends UnauthorizedException {
  readonly errorCode = 'AUTH_REFRESH_TOKEN_EXPIRED';

  constructor() {
    super('Refresh token has expired.');
  }
}

export class RefreshTokenReuseDetectedException extends UnauthorizedException {
  readonly errorCode = 'AUTH_REFRESH_TOKEN_REUSE_DETECTED';

  constructor() {
    super(
      'Refresh token has already been used; all sessions for this user have been revoked.',
    );
  }
}
