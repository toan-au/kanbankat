import { describe, it } from "node:test";
import app from "../app";
import supertest from "supertest";

describe("Healthcheck", () => {
  it("Should return 200 OK", async () => {
    await supertest(app).get("/healthcheck").expect(200);
  });
});
