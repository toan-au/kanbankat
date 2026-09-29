import { Prisma, PrismaClient } from '@prisma/client';
import { PostgresTestDatabase } from '../test-utils/postgres-testcontainer';

// Stage 2 acceptance tests: proves the schema's structural guarantees
// actually hold against a real Postgres instance -- foreign keys, cascade
// deletes, uniqueness, defaults. This is the whole point of moving off the
// embedded-document Mongo model (see docs/nestjs-migration-spec.md, "Why"),
// so these are asserted directly rather than assumed.
describe('Prisma schema', () => {
  const db = new PostgresTestDatabase();
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await db.start();
  }, 60_000);

  afterEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.stop();
  });

  async function createUser(overrides: Partial<Prisma.UserCreateInput> = {}) {
    return prisma.user.create({
      data: { displayName: 'Test User', googleId: 'google-1', ...overrides },
    });
  }

  async function createBoard(
    userId: string,
    overrides: Partial<Prisma.BoardCreateInput> = {},
  ) {
    return prisma.board.create({
      data: {
        name: 'Test Board',
        user: { connect: { id: userId } },
        ...overrides,
      },
    });
  }

  describe('foreign keys', () => {
    it('rejects a Board referencing a nonexistent userId', async () => {
      await expect(
        prisma.board.create({
          data: { name: 'Orphan', userId: 'does-not-exist' },
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });

    it('rejects a List referencing a nonexistent boardId', async () => {
      await expect(
        prisma.list.create({
          data: { name: 'Orphan', position: 1, boardId: 'does-not-exist' },
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });

    it('rejects a Task referencing a nonexistent listId', async () => {
      await expect(
        prisma.task.create({
          data: { name: 'Orphan', position: 1, listId: 'does-not-exist' },
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });
  });

  describe('cascade deletes', () => {
    it('deleting a User deletes their Boards and RefreshTokens', async () => {
      const user = await createUser();
      const board = await createBoard(user.id);
      await prisma.refreshToken.create({
        data: { tokenHash: 'hash-1', user: { connect: { id: user.id } } },
      });

      await prisma.user.delete({ where: { id: user.id } });

      expect(
        await prisma.board.findUnique({ where: { id: board.id } }),
      ).toBeNull();
      expect(
        await prisma.refreshToken.findMany({ where: { userId: user.id } }),
      ).toEqual([]);
    });

    it('deleting a Board deletes its Lists and Labels', async () => {
      const user = await createUser();
      const board = await createBoard(user.id);
      const list = await prisma.list.create({
        data: {
          name: 'To Do',
          position: 1,
          board: { connect: { id: board.id } },
        },
      });
      const label = await prisma.label.create({
        data: {
          text: 'Bug',
          hexColour: '#FF0000',
          board: { connect: { id: board.id } },
        },
      });

      await prisma.board.delete({ where: { id: board.id } });

      expect(
        await prisma.list.findUnique({ where: { id: list.id } }),
      ).toBeNull();
      expect(
        await prisma.label.findUnique({ where: { id: label.id } }),
      ).toBeNull();
    });

    it('deleting a List deletes its Tasks', async () => {
      const user = await createUser();
      const board = await createBoard(user.id);
      const list = await prisma.list.create({
        data: {
          name: 'To Do',
          position: 1,
          board: { connect: { id: board.id } },
        },
      });
      const task = await prisma.task.create({
        data: {
          name: 'Buy milk',
          position: 1,
          list: { connect: { id: list.id } },
        },
      });

      await prisma.list.delete({ where: { id: list.id } });

      expect(
        await prisma.task.findUnique({ where: { id: task.id } }),
      ).toBeNull();
    });
  });

  describe('uniqueness', () => {
    it('rejects a duplicate RefreshToken.tokenHash', async () => {
      const user = await createUser();
      await prisma.refreshToken.create({
        data: { tokenHash: 'dup-hash', user: { connect: { id: user.id } } },
      });

      await expect(
        prisma.refreshToken.create({
          data: { tokenHash: 'dup-hash', user: { connect: { id: user.id } } },
        }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('rejects a duplicate User.googleId', async () => {
      await createUser({ googleId: 'shared-google-id' });

      await expect(
        createUser({
          googleId: 'shared-google-id',
          displayName: 'Someone Else',
        }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('allows multiple Users with no githubId (NULL is not a duplicate)', async () => {
      await createUser({ googleId: 'g-1', githubId: null });
      await createUser({ googleId: 'g-2', githubId: null });

      expect(await prisma.user.count()).toBe(2);
    });
  });

  describe('defaults', () => {
    it('Board defaults deleted=false, about=""', async () => {
      const user = await createUser();
      const board = await createBoard(user.id);

      expect(board.deleted).toBe(false);
      expect(board.about).toBe('');
      expect(board.deletedOn).toBeNull();
    });

    it('Task defaults color="none", content=""', async () => {
      const user = await createUser();
      const board = await createBoard(user.id);
      const list = await prisma.list.create({
        data: {
          name: 'To Do',
          position: 1,
          board: { connect: { id: board.id } },
        },
      });
      const task = await prisma.task.create({
        data: {
          name: 'Buy milk',
          position: 1,
          list: { connect: { id: list.id } },
        },
      });

      expect(task.color).toBe('none');
      expect(task.content).toBe('');
    });
  });

  describe('fractional ordering', () => {
    it('orders Tasks by position, including a value inserted between two others', async () => {
      const user = await createUser();
      const board = await createBoard(user.id);
      const list = await prisma.list.create({
        data: {
          name: 'To Do',
          position: 1,
          board: { connect: { id: board.id } },
        },
      });

      await prisma.task.create({
        data: { name: 'first', position: 1, listId: list.id },
      });
      await prisma.task.create({
        data: { name: 'last', position: 2, listId: list.id },
      });
      // Inserted between the two above without touching their position values.
      await prisma.task.create({
        data: { name: 'middle', position: 1.5, listId: list.id },
      });

      const ordered = await prisma.task.findMany({
        where: { listId: list.id },
        orderBy: { position: 'asc' },
      });

      expect(ordered.map((t) => t.name)).toEqual(['first', 'middle', 'last']);
    });
  });
});
