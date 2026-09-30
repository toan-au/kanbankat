import type { IncomingMessage, ServerResponse } from 'node:http';
import { genRequestId } from './request-id';

describe('genRequestId', () => {
  function fakeReq(xRequestId: string | string[] | undefined): IncomingMessage {
    return {
      headers: { 'x-request-id': xRequestId },
    } as unknown as IncomingMessage;
  }

  // Separate jest.Mock reference, kept apart from the ServerResponse-typed
  // object, so assertions target the mock directly instead of a property
  // access that trips @typescript-eslint/unbound-method.
  function fakeRes(): { res: ServerResponse; setHeader: jest.Mock } {
    const setHeader = jest.fn();
    const res = { setHeader } as unknown as ServerResponse;
    return { res, setHeader };
  }

  it('generates a fresh id when no inbound header is present', () => {
    const { res, setHeader } = fakeRes();

    const id = genRequestId(fakeReq(undefined), res);

    expect(id.length).toBeGreaterThan(0);
    expect(setHeader).toHaveBeenCalledWith('X-Request-Id', id);
  });

  it('reuses an inbound X-Request-Id header', () => {
    const { res, setHeader } = fakeRes();

    const id = genRequestId(fakeReq('inbound-id-123'), res);

    expect(id).toBe('inbound-id-123');
    expect(setHeader).toHaveBeenCalledWith('X-Request-Id', 'inbound-id-123');
  });

  it('generates a fresh id when the inbound header is an empty string', () => {
    const id = genRequestId(fakeReq(''), fakeRes().res);

    expect(id).not.toBe('');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates a fresh id when the inbound header has multiple values', () => {
    // Ambiguous which of several values is authoritative -- treat as absent
    // rather than guessing.
    const id = genRequestId(fakeReq(['a', 'b']), fakeRes().res);

    expect(id).not.toBe('a');
    expect(id).not.toBe('b');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates different ids across calls with no inbound header', () => {
    const first = genRequestId(fakeReq(undefined), fakeRes().res);
    const second = genRequestId(fakeReq(undefined), fakeRes().res);

    expect(first).not.toBe(second);
  });
});
