import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BoardOwnerGuard } from './board-owner.guard';
import { PrismaService } from '../../prisma/prisma.service';

// Replaces the old Express app's requireOwnBoard middleware. Worth noting:
// that middleware had a real bug fixed earlier in this project (sent a 401
// but still called next() unconditionally, letting the request through
// anyway regardless). That specific bug class structurally can't recur
// here -- Nest guards communicate pass/fail via a return value or a thrown
// exception, not a manually invoked next() callback, so there's no code
// path that can both deny and allow the same request.

function createContext(req: {
  user?: { id: string };
  params: { boardId?: string };
}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe('BoardOwnerGuard', () => {
  let guard: BoardOwnerGuard;
  let prisma: { board: { findUnique: jest.Mock } };

  beforeEach(() => {
    prisma = { board: { findUnique: jest.fn() } };
    guard = new BoardOwnerGuard(prisma as unknown as PrismaService);
  });

  it('allows the request when the board belongs to the authenticated user', async () => {
    prisma.board.findUnique.mockResolvedValue({
      id: 'board-1',
      userId: 'user-1',
    });
    const context = createContext({
      user: { id: 'user-1' },
      params: { boardId: 'board-1' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('throws ForbiddenException when the board belongs to someone else', async () => {
    prisma.board.findUnique.mockResolvedValue({
      id: 'board-1',
      userId: 'someone-else',
    });
    const context = createContext({
      user: { id: 'user-1' },
      params: { boardId: 'board-1' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws NotFoundException when the board does not exist', async () => {
    prisma.board.findUnique.mockResolvedValue(null);
    const context = createContext({
      user: { id: 'user-1' },
      params: { boardId: 'does-not-exist' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });

  it('queries by the boardId route param', async () => {
    prisma.board.findUnique.mockResolvedValue({
      id: 'board-1',
      userId: 'user-1',
    });
    const context = createContext({
      user: { id: 'user-1' },
      params: { boardId: 'board-1' },
    });

    await guard.canActivate(context);

    expect(prisma.board.findUnique).toHaveBeenCalledWith({
      where: { id: 'board-1' },
    });
  });
});
