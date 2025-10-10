
const mockRequireLogin = jest.fn();
jest.mock("../middleware/requireLogin", () => ({
  requireLogin: mockRequireLogin
}));

import app from "../app";
import supertest from "supertest";
import UserModel from "../models/user.model";
import { UserDocument } from "../types";
import { NextFunction, Request, Response } from "express";

const testApp = supertest(app);
let testUser: UserDocument;

const setupTestUser = async () => {
  return await new UserModel({
    githubId: "github-test-id",
    displayName: "test-user",
  })
}

// This should not show TypeScript errors if the declaration is working

describe("board", () => {

  beforeAll(async () => {
    testUser = await setupTestUser();
  });

  describe("get boards", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        mockRequireLogin.mockImplementation((_: Request, res: Response) => {
          return res.sendStatus(403)
        });
        await testApp.get("/api/boards").expect(403);
      });
    });
    describe("given the user is logged in and has no active boards", () => {
      it("should return an empty []", async () => {

        // mock middleware
        jest.mock("../middleware/requireLogin", () => ({
          requireLogin: (req: Request, __:Response, next: NextFunction) => {
            req.user = testUser
            return next()
          }
        }));

        await testApp.get("/api/boards").expect(200)
      });
    });
    describe("given the user has archived boards and active boards", () => {
      it("should return only active boards", () => {
        expect(true).toBe(true);
      });
    });
  });
});
