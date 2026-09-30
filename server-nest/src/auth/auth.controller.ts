import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = { httpOnly: true } as const;

// OAuth initiate/callback routes (/google, /github, and their callbacks)
// aren't covered here -- same call made in auth.controller.spec.ts: not
// meaningfully testable without hitting real providers. They get added
// directly, driven by Passport, without needing tests of their own.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const currentRefreshToken = req.cookies[REFRESH_COOKIE];
    if (!currentRefreshToken) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshTokens(currentRefreshToken);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const currentRefreshToken = req.cookies[REFRESH_COOKIE];
    if (currentRefreshToken) {
      await this.authService.revokeRefreshToken(currentRefreshToken);
    }
    res.clearCookie(REFRESH_COOKIE);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.revokeAllRefreshTokensForUser(
      req.user?.id as string,
    );
    res.clearCookie(REFRESH_COOKIE);
  }
}
