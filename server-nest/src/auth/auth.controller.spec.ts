import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// OAuth initiate/callback routes (/auth/google, /auth/github, and their
// callbacks) aren't covered here -- same call made for the old Express
// app's auth.test.ts: they go through Passport against real Google/GitHub
// and aren't meaningfully testable without hitting those providers.
describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    refreshTokens: jest.Mock;
    revokeRefreshToken: jest.Mock;
    revokeAllRefreshTokensForUser: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      refreshTokens: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllRefreshTokensForUser: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  function mockResponse(): Response {
    return {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
  }

  describe('refresh', () => {
    it('exchanges the refresh cookie for a new pair and sets the new refresh cookie', async () => {
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
      const req = {
        cookies: { refreshToken: 'old-refresh' },
      } as unknown as Request;
      const res = mockResponse();

      const result = await controller.refresh(req, res);

      expect(authService.refreshTokens).toHaveBeenCalledWith('old-refresh');
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ accessToken: 'new-access' });
    });
  });

  describe('logout', () => {
    it('revokes the current refresh token and clears the cookie', async () => {
      const req = {
        cookies: { refreshToken: 'current-refresh' },
      } as unknown as Request;
      const res = mockResponse();

      await controller.logout(req, res);

      expect(authService.revokeRefreshToken).toHaveBeenCalledWith(
        'current-refresh',
      );
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('logoutAll', () => {
    it('revokes every refresh token for the authenticated user and clears the cookie', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      const res = mockResponse();

      await controller.logoutAll(req, res);

      expect(authService.revokeAllRefreshTokensForUser).toHaveBeenCalledWith(
        'user-1',
      );
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    });
  });
});
