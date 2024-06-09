import { Request, Response, NextFunction } from "express";

const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  req.user ? next() : res.sendStatus(403);
};

export default requireLogin;
