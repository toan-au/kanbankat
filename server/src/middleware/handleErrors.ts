import { Request, Response } from "express";

interface Error {
  statusCode?: number;
  status?: string;
  message: string;
}

const handleErrors = (
  error: Error,
  _req: Request,
  res: Response,
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
