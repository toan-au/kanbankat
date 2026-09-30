import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppExceptionFilter } from './app-exception.filter';
import { InvalidRefreshTokenException } from '../../auth/exceptions/refresh-token.exceptions';

describe('AppExceptionFilter', () => {
  // Separate jest.Mock references, kept apart from the Logger/Response-typed
  // objects passed into the filter, so assertions target the mock directly
  // instead of a property access that trips @typescript-eslint/unbound-method.
  let warn: jest.Mock;
  let error: jest.Mock;
  let status: jest.Mock;
  let json: jest.Mock;
  let logger: Logger;
  let filter: AppExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };

  function mockHost(request: Record<string, unknown>): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
  }

  beforeEach(() => {
    warn = jest.fn();
    error = jest.fn();
    logger = { warn, error } as unknown as Logger;
    filter = new AppExceptionFilter(logger);
    status = jest.fn().mockReturnThis();
    json = jest.fn();
    response = { status, json };
  });

  it("uses a custom exception's own errorCode and status", () => {
    filter.catch(new InvalidRefreshTokenException(), mockHost({ id: 'req-1' }));

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      errorCode: 'AUTH_INVALID_REFRESH_TOKEN',
      message: 'Refresh token is invalid or does not exist.',
      requestId: 'req-1',
      timestamp: expect.any(String),
    });
    expect(warn).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('falls back to a status-derived errorCode for a bare Nest exception', () => {
    filter.catch(new HttpException('nope', 403), mockHost({ id: 'req-2' }));

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'FORBIDDEN', message: 'nope' }),
    );
  });

  it('joins a class-validator style message array', () => {
    filter.catch(
      new BadRequestException({
        statusCode: 400,
        message: ['name must not be empty', 'name must be a string'],
        error: 'Bad Request',
      }),
      mockHost({ id: 'req-3' }),
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'name must not be empty, name must be a string',
      }),
    );
  });

  it('hides internal details and logs at error level for an unexpected error', () => {
    filter.catch(
      new Error('db connection string leaked'),
      mockHost({ id: 'req-4' }),
    );

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      requestId: 'req-4',
      timestamp: expect.any(String),
    });
    expect(error).toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('falls back to "unknown" when the request has no id', () => {
    filter.catch(new InvalidRefreshTokenException(), mockHost({}));

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'unknown' }),
    );
  });
});
