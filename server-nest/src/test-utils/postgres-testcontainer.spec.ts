import { PostgresTestDatabase } from './postgres-testcontainer';
import { PrismaClient } from '@prisma/client';

// Stage 1 acceptance test: proves the infrastructure plumbing works end to
// end -- container start, migration applied, client connected, query
// succeeds, data clears between tests, container tears down cleanly. No
// domain logic here; that starts in Stage 2.
describe('PostgresTestDatabase (Stage 1 infra)', () => {
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

  it('connects to a real, migrated Postgres instance', async () => {
    const result = await prisma.$queryRaw<
      { result: number }[]
    >`SELECT 1 as result`;
    expect(result).toEqual([{ result: 1 }]);
  });

  it('applied the Stage 1 placeholder migration', async () => {
    const created = await prisma.stageOneCheck.create({ data: {} });
    expect(created.id).toBeGreaterThan(0);

    const found = await prisma.stageOneCheck.findUnique({
      where: { id: created.id },
    });
    expect(found).not.toBeNull();
  });

  it('clears data between tests (this table should be empty again)', async () => {
    const rows = await prisma.stageOneCheck.findMany();
    expect(rows).toEqual([]);
  });
});
