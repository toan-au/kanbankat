import { Request, Response, NextFunction } from "express";

const asyncHandler = (
  routeHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(routeHandler(req, res, next)).catch(next);
  };
};

export default asyncHandler;
