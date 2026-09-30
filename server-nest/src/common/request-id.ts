import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export function genRequestId(
  req: IncomingMessage,
  res: ServerResponse,
): string {
  const inbound = req.headers['x-request-id'];
  const id =
    typeof inbound === 'string' && inbound.length > 0 ? inbound : randomUUID();

  res.setHeader('X-Request-Id', id);
  return id;
}
