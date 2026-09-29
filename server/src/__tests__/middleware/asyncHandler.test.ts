import { Request, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";

describe("asyncHandler middleware", () => {
  const req = {} as Request;
  const res = {} as Response;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves without calling next() when the handler succeeds", async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards a rejected promise's error to next()", async () => {
    const error = new Error("handler failed");
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
