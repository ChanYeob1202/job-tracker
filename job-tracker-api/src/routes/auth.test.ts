import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

// Integration test: send a real HTTP request to the Express app (in-memory,
// no port) and check the response — the route, Zod validation, DB query, and
// bcrypt all run together, just like a real client would trigger them.
describe("POST /auth/login", () => {
  test("returns 401 for a user that does not exist", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "definitely-not-a-real-user@test.com", password: "whatever123" });

    expect(res.status).toBe(401);
  });
});

//Integration test: send not matching password

describe("POST /auth/signup", () => {
  test("returns 400 password too short"
    , async() => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "arcnewef24@test.com", password:"test123"});

      expect(res.status).toBe(400)
  })
})


