import { Request, Response, NextFunction } from "express";
import { Board } from "../types";

const requireOwnBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.params.boardId) {
    const match = req.user?.boards.filter(
      (board: Board) => board._id.toString() == req.params.boardId
    );
    if (match && match.length == 0)
      res.status(401).send({ error: "this is not your board" });
    next();
  }
  next();
};

export default requireOwnBoard;
