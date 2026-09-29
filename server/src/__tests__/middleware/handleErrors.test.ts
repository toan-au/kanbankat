import { Request, Response } from "express";
import handleErrors from "../../middleware/handleErrors";

describe("handleErrors middleware", () => {
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status };
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("defaults statusCode to 500 and status to 'error' when not provided", () => {
    const error = { message: "boom" };

    handleErrors(error, {} as Request, res as Response, jest.fn());

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ status: "error", message: "boom" });
  });

  it("preserves an explicit statusCode and status", () => {
    const error = { statusCode: 404, status: "not-found", message: "missing" };

    handleErrors(error, {} as Request, res as Response, jest.fn());

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ status: "not-found", message: "missing" });
  });

  it("logs the error", () => {
    const error = { message: "boom" };

    handleErrors(error, {} as Request, res as Response, jest.fn());

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
  });
});
