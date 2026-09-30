import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BoardOwnerGuard } from './guards/board-owner.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // Matches JwtStrategy's own secretOrKey fallback (see jwt.strategy.ts)
    // -- no env-config module exists yet, so both read process.env directly.
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? '',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, BoardOwnerGuard],
  exports: [AuthService, JwtAuthGuard, BoardOwnerGuard],
})
export class AuthModule {}
