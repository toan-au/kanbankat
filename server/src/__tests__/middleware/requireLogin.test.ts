import { Request, Response } from "express";
import requireLogin from "../../middleware/requireLogin";
import { UserDocument } from "../../types";

describe("requireLogin middleware", () => {
  const next = jest.fn();
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { sendStatus: jest.fn() };
  });

  it("calls next() when req.user is present", () => {
    const req = { user: { _id: "user-1" } as UserDocument } as Request;

    requireLogin(req, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it("sends 403 when req.user is missing", () => {
    const req = {} as Request;

    requireLogin(req, res as Response, next);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
