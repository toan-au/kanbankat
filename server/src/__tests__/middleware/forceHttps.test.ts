import { Request, Response } from "express";
import forceHttps from "../../middleware/forceHttps";

describe("forceHttps middleware", () => {
  const next = jest.fn();
  const originalNodeEnv = process.env.NODE_ENV;
  let res: Partial<Response>;
  let redirect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    redirect = jest.fn();
    res = { redirect };
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("redirects http to https in production", () => {
    process.env.NODE_ENV = "production";
    const req = {
      protocol: "http",
      headers: { host: "kanbankat.com" },
      url: "/dashboard",
    } as Request;

    forceHttps(req, res as Response, next);

    expect(redirect).toHaveBeenCalledWith("https://kanbankat.com/dashboard");
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when already https in production", () => {
    process.env.NODE_ENV = "production";
    const req = { protocol: "https", headers: {}, url: "/" } as Request;

    forceHttps(req, res as Response, next);

    expect(redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next() for http outside production", () => {
    process.env.NODE_ENV = "development";
    const req = { protocol: "http", headers: {}, url: "/" } as Request;

    forceHttps(req, res as Response, next);

    expect(redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
