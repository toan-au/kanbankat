import {
  Controller,
  NotImplementedException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

// Skeleton only -- see auth.controller.spec.ts. OAuth initiate/callback
// routes (/google, /github, and their callbacks) aren't stubbed here since
// they're not covered by any test (not meaningfully testable without
// hitting real providers); they get added directly during implementation.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  refresh(
    @Req() _req: Request,
    @Res({ passthrough: true }) _res: Response,
  ): Promise<{ accessToken: string }> {
    return Promise.reject(new NotImplementedException());
  }

  @Post('logout')
  logout(
    @Req() _req: Request,
    @Res({ passthrough: true }) _res: Response,
  ): Promise<void> {
    return Promise.reject(new NotImplementedException());
  }

  @Post('logout-all')
  logoutAll(
    @Req() _req: Request,
    @Res({ passthrough: true }) _res: Response,
  ): Promise<void> {
    return Promise.reject(new NotImplementedException());
  }
}
