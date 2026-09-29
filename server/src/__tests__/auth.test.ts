import supertest from "supertest";
import app from "../app";

const testApp = supertest(app);

// OAuth initiate/callback routes (/auth/google, /auth/google/callback,
// /auth/github, /auth/github/callback) go through passport.authenticate()
// against the real Google/GitHub strategies and aren't meaningfully testable
// without hitting those providers, so they're intentionally not covered here.
describe("Auth Routes", () => {
  describe("GET /auth/current", () => {
    it("returns an empty object when no user is logged in", async () => {
      const response = await testApp.get("/auth/current").expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe("GET /auth/logout", () => {
    it("redirects to / after logging out", async () => {
      await testApp.get("/auth/logout").expect(302).expect("Location", "/");
    });
  });
});
