import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  const user = { id: 'user-1', displayName: 'Ada' };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ user: { findUnique: jest.fn().mockResolvedValue(user) } })
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = app.get(JwtService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects GET /users/me with no Authorization header', () => {
    return request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('returns the authenticated user for a valid access token', async () => {
    const accessToken = jwtService.sign({ sub: user.id });

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toEqual(user);
  });
});
