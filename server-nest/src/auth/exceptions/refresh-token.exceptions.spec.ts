import { HttpStatus } from '@nestjs/common';
import {
  InvalidRefreshTokenException,
  RefreshTokenExpiredException,
  RefreshTokenReuseDetectedException,
  RefreshTokenRevokedException,
} from './refresh-token.exceptions';

describe('refresh token exceptions', () => {
  it.each([
    ['InvalidRefreshTokenException', new InvalidRefreshTokenException()],
    ['RefreshTokenRevokedException', new RefreshTokenRevokedException()],
    ['RefreshTokenExpiredException', new RefreshTokenExpiredException()],
    [
      'RefreshTokenReuseDetectedException',
      new RefreshTokenReuseDetectedException(),
    ],
  ])('%s is a 401 with a distinct errorCode', (_name, exception) => {
    expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    expect(exception.errorCode).toEqual(expect.any(String));
    expect(exception.errorCode.length).toBeGreaterThan(0);
  });

  it('gives each exception a different errorCode', () => {
    const errorCodes = [
      new InvalidRefreshTokenException(),
      new RefreshTokenRevokedException(),
      new RefreshTokenExpiredException(),
      new RefreshTokenReuseDetectedException(),
    ].map((exception) => exception.errorCode);

    expect(new Set(errorCodes).size).toBe(errorCodes.length);
  });
});
