import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';

/**
 * Spins up a real, ephemeral PostgreSQL container, runs the Prisma migrations
 * against it, and returns a connected PrismaClient. Mirrors the shape of the
 * mongodb-memory-server helper in the old Express app's test suite
 * (server/src/__tests__/setup/mongoMemoryServer.ts) -- same connect/clear/close
 * lifecycle, different engine underneath.
 *
 * Requires a Docker daemon available wherever tests run (local dev machine and
 * CI). This is a deliberate trade-off (see docs/nestjs-migration-spec.md,
 * "DB testing"): mocking the database layer here would undermine the whole
 * reason for choosing Postgres in the first place.
 */
export class PostgresTestDatabase {
  private container?: StartedPostgreSqlContainer;
  private prisma?: PrismaClient;

  async start(): Promise<PrismaClient> {
    this.container = await new PostgreSqlContainer(
      'postgres:16-alpine',
    ).start();

    const databaseUrl = this.container.getConnectionUri();

    // Prisma's migration engine is invoked via its CLI, not a JS API -- run it
    // as a subprocess against the container's connection string.
    execFileSync(
      'npx',
      [
        'prisma',
        'migrate',
        'deploy',
        '--schema',
        path.join(__dirname, '..', '..', 'prisma', 'schema.prisma'),
      ],
      {
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'pipe',
      },
    );

    this.prisma = new PrismaClient({
      datasources: { db: { url: databaseUrl } },
    });
    await this.prisma.$connect();
    return this.prisma;
  }

  async clear(): Promise<void> {
    if (!this.prisma) throw new Error('PostgresTestDatabase not started');

    const tables: { tablename: string }[] = await this.prisma.$queryRaw`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma%'
    `;

    for (const { tablename } of tables) {
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`,
      );
    }
  }

  async stop(): Promise<void> {
    await this.prisma?.$disconnect();
    await this.container?.stop();
  }
}
