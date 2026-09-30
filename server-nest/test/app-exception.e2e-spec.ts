import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { InvalidRefreshTokenException } from './../src/auth/exceptions/refresh-token.exceptions';

// Registered alongside the real AppModule (not part of it) purely so this
// spec has routes to throw from -- proves the app's real, globally
// registered AppExceptionFilter and request-id middleware, not a throwaway
// test module's own wiring.
@Controller('test-errors')
class TestErrorController {
  @Get('custom')
  throwCustom(): never {
    throw new InvalidRefreshTokenException();
  }

  @Get('unexpected')
  throwUnexpected(): never {
    throw new Error('db connection string leaked');
  }
}

describe('AppExceptionFilter (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestErrorController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('shapes a custom exception into {errorCode, message, requestId, timestamp} and sets X-Request-Id', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-errors/custom')
      .expect(401);

    expect(res.body).toEqual({
      errorCode: 'AUTH_INVALID_REFRESH_TOKEN',
      message: 'Refresh token is invalid or does not exist.',
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });
    expect(res.headers['x-request-id']).toBe(res.body.requestId);
  });

  it('echoes an inbound X-Request-Id back on both the header and the error body', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-errors/custom')
      .set('X-Request-Id', 'client-supplied-id')
      .expect(401);

    expect(res.headers['x-request-id']).toBe('client-supplied-id');
    expect(res.body.requestId).toBe('client-supplied-id');
  });

  it('hides internal details behind a generic message for an unexpected error', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-errors/unexpected')
      .expect(500);

    expect(res.body).toEqual({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });
    expect(JSON.stringify(res.body)).not.toContain('db connection string');
  });
});
