import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// Proves the fix for a real bug: POST /auth/logout-all had no guard, so
// req.user was always undefined and revokeAllRefreshTokensForUser(undefined)
// revoked every refresh token for every user (Prisma treats an undefined
// where-field as "no filter", not "match nothing"). PrismaService is
// overridden here so app.init() doesn't need a live Postgres -- this route
// should reject before JwtStrategy.validate() ever touches the DB anyway.
describe('JwtAuthGuard (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ user: { findUnique: jest.fn() } })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects /auth/logout-all with no Authorization header', () => {
    return request(app.getHttpServer()).post('/auth/logout-all').expect(401);
  });

  it('rejects /auth/logout-all with a malformed Authorization header', () => {
    return request(app.getHttpServer())
      .post('/auth/logout-all')
      .set('Authorization', 'not-a-bearer-token')
      .expect(401);
  });

  it('rejects /auth/logout-all with a well-formed but invalid JWT', () => {
    return request(app.getHttpServer())
      .post('/auth/logout-all')
      .set('Authorization', 'Bearer not.a.valid.jwt')
      .expect(401);
  });
});
