const app = require("../app");
const supertest = require("supertest");

describe("Healthcheck", () => {
  it("Should return 200 OK", async () => {
    await supertest(app).get("/healthcheck").expect(200);
  });
});
