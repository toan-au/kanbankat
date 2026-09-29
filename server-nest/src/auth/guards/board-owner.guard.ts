import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Skeleton only -- see board-owner.guard.spec.ts for intended behavior:
// allow when the board belongs to req.user, ForbiddenException when it
// belongs to someone else, NotFoundException when it doesn't exist.
@Injectable()
export class BoardOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  canActivate(_context: ExecutionContext): Promise<boolean> {
    return Promise.reject(new NotImplementedException());
  }
}
