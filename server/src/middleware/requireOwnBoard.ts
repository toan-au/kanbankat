import { Request, Response, NextFunction } from "express";
import { BoardDocument } from "../types";

const requireOwnBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.params.boardId) {
    const match = req.user?.boards.filter(
      (board: BoardDocument) => board._id.toString() == req.params.boardId
    );
    if (match && match.length == 0)
      res.status(401).send({ error: "this is not your board" });
    return next();
  }
  return next();
};

export default requireOwnBoard;
