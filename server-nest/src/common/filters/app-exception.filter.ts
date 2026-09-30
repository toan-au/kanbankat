import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { Logger } from 'nestjs-pino';

interface ErrorResponseBody {
  errorCode: string;
  message: string;
  requestId: string;
  timestamp: string;
}

function hasErrorCode(exception: unknown): exception is { errorCode: string } {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    typeof (exception as { errorCode?: unknown }).errorCode === 'string'
  );
}

@Injectable()
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<{ id?: string }>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseBody = {
      errorCode: this.resolveErrorCode(exception, status),
      message:
        status >= 500
          ? 'Internal server error'
          : this.resolveMessage(exception),
      requestId: request.id ?? 'unknown',
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error({ err: exception, ...body }, 'Unhandled exception');
    } else {
      this.logger.warn(body, body.message);
    }

    response.status(status).json(body);
  }

  private resolveErrorCode(exception: unknown, status: number): string {
    if (hasErrorCode(exception)) {
      return exception.errorCode;
    }
    return HttpStatus[status] ?? 'UNKNOWN_ERROR';
  }

  private resolveMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) {
      return 'Unexpected error';
    }

    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const { message } = response;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }
    return 'Unexpected error';
  }
}
