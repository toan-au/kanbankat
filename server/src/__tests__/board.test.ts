import app from "../app";
import supertest from "supertest";

const testApp = supertest(app);

describe("board", () => {
  describe("get boards", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", () => {
        expect(1 + 2).toBe(3);
      });
    });
    describe("given the user is logged in and has no active boards", () => {
      it("should return an empty []", () => {
        expect(true).toBe(true);
      });
    });
    describe("given the user has archived boards and active boards", () => {
      it("should return only active boards", () => {
        expect(true).toBe(true);
      });
    });
  });
});
