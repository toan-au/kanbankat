import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Replaces the old Express app's GET /auth/current. That route returned
// 200 {} for a logged-out visitor; this one 401s instead, via the guard --
// deliberate, matches every other guarded route in this migration.
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me')
  me(@Req() req: Request): User {
    return req.user as User;
  }
}
