import { Request, Response, NextFunction } from "express";

interface Error {
  statusCode?: number;
  status?: string;
  message: string;
}

const handleErrors = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(error);
  error.statusCode ??= 500;
  error.status ??= "error";
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

export default handleErrors;
