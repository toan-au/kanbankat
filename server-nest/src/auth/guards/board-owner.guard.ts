import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Replaces the old Express app's requireOwnBoard middleware -- see
// board-owner.guard.spec.ts for the note on why that middleware's
// send-401-but-still-call-next bug can't recur in this shape.
@Injectable()
export class BoardOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // A named :boardId route segment is always a single string; the
    // string[] half of Express's param type only applies to wildcard/repeated
    // segments, which this route never uses.
    const boardId = request.params.boardId as string;

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException();
    }
    if (board.userId !== request.user?.id) {
      throw new ForbiddenException();
    }

    return true;
  }
}
