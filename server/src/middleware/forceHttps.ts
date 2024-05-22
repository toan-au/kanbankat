import { Request, Response, NextFunction } from "express";

const forceHttps = (req: Request, res: Response, next: NextFunction) => {
  if (req.protocol === "http" && process.env.NODE_ENV === "production") {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
};

export default forceHttps;
