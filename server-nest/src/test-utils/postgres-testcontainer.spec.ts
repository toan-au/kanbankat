import { PostgresTestDatabase } from './postgres-testcontainer';
import { PrismaClient } from '@prisma/client';

// Proves the test harness itself works: container start, migrations
// applied, client connected, query succeeds, container tears down clean.
// Domain-schema behavior (constraints, cascades, etc.) is covered in
// src/prisma/schema.spec.ts instead of here.
describe('PostgresTestDatabase (infra)', () => {
  const db = new PostgresTestDatabase();
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await db.start();
  }, 60_000);

  afterAll(async () => {
    await db.stop();
  });

  it('connects to a real, migrated Postgres instance', async () => {
    const result = await prisma.$queryRaw<
      { result: number }[]
    >`SELECT 1 as result`;
    expect(result).toEqual([{ result: 1 }]);
  });
});
