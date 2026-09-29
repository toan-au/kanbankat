import { Injectable, NotImplementedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
}

// Constructor/super() wiring is real (passport-jwt needs it to extract and
// verify the token before validate() ever runs); only the payload -> user
// lookup in validate() is a stub. See jwt.strategy.spec.ts.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? '',
    });
  }

  validate(_payload: JwtPayload): Promise<User> {
    return Promise.reject(new NotImplementedException());
  }
}
