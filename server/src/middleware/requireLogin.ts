import { Request, Response, NextFunction } from "express";

const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  req.user ? next() : res.redirect("/");
};

export default requireLogin;
