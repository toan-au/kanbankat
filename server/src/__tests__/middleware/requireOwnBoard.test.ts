import { Request, Response } from "express";
import mongoose from "mongoose";
import requireOwnBoard from "../../middleware/requireOwnBoard";
import { BoardDocument, UserDocument } from "../../types";

describe("requireOwnBoard middleware", () => {
  const next = jest.fn();
  let res: Partial<Response>;
  let status: jest.Mock;
  let send: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    send = jest.fn();
    status = jest.fn().mockReturnValue({ send });
    res = { status };
  });

  it("calls next() without checking ownership when req.params.boardId is absent", async () => {
    const req = { params: {}, user: undefined } as unknown as Request;

    await requireOwnBoard(req, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
  });

  it("calls next() when the board is among the user's boards", async () => {
    const boardId = new mongoose.Types.ObjectId();
    const req = {
      params: { boardId: boardId.toString() },
      user: { boards: [{ _id: boardId } as BoardDocument] } as UserDocument,
    } as unknown as Request;

    await requireOwnBoard(req, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
  });

  it("sends 401 when the board is not among the user's boards, but still calls next() (existing behavior)", async () => {
    const boardId = new mongoose.Types.ObjectId();
    const otherBoardId = new mongoose.Types.ObjectId();
    const req = {
      params: { boardId: boardId.toString() },
      user: { boards: [{ _id: otherBoardId } as BoardDocument] } as UserDocument,
    } as unknown as Request;

    await requireOwnBoard(req, res as Response, next);

    // Documents current behavior: the middleware sends a 401 response but
    // unconditionally falls through to next() as well, rather than returning
    // after sending the response. Downstream code ends up running anyway.
    expect(status).toHaveBeenCalledWith(401);
    expect(send).toHaveBeenCalledWith({ error: "this is not your board" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next() without sending 401 when req.user is undefined (no boards to check)", async () => {
    const boardId = new mongoose.Types.ObjectId();
    const req = {
      params: { boardId: boardId.toString() },
      user: undefined,
    } as unknown as Request;

    await requireOwnBoard(req, res as Response, next);

    // req.user?.boards is undefined, so `match` is undefined and the
    // `match && match.length == 0` guard never fires.
    expect(status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
