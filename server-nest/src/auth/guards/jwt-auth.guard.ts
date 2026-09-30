import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Runs JwtStrategy against the request. Delegates entirely to
// @nestjs/passport -- see jwt.strategy.ts for the actual verify/lookup
// logic this triggers.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
