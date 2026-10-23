import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { pool } from "../db/pool.js";

// Replace the real Postgres pool with a fake one. Local .env points at the
// same Neon DB as production, so these tests must never touch it. Each test
// tells the fake `query` what to return, then checks what the route sent it.
vi.mock("../db/pool.js", () => ({
  pool: { query: vi.fn() },
}));

const query = vi.mocked(pool.query);

// Fake DB result: only the fields the routes actually read.
function dbResult(rows: object[]) {
  return { rows, rowCount: rows.length, fields: [] } as never;
}

process.env.JWT_SECRET ??= "test-secret";

const USER_ID = "11111111-1111-1111-1111-111111111111";
const JOB_ID = "22222222-2222-2222-2222-222222222222";

// Sign a real JWT, the same shape the login route hands out ({ userID }).
function authHeader(userID: string = USER_ID) {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET as string);
  return `Bearer ${token}`;
}

beforeEach(() => {
  query.mockReset();
  // Routes log on purpose (errors, PATCH bodies); keep test output readable.
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("auth guard on /jobs", () => {
  test("returns 401 when the Authorization header is missing", async () => {
    const res = await request(app).get("/jobs");

    expect(res.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });

  test("returns 403 when the token's userID is not a UUID", async () => {
    const res = await request(app)
      .get("/jobs")
      .set("Authorization", authHeader("not-a-uuid"));

    expect(res.status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });
});

describe("GET /jobs", () => {
  test("only queries jobs that belong to the logged-in user", async () => {
    query.mockResolvedValueOnce(dbResult([{ id: JOB_ID, company: "GM" }]));

    const res = await request(app).get("/jobs").set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body.rows).toEqual([{ id: JOB_ID, company: "GM" }]);
    // The SQL must be scoped by user_id, and the value must be OUR user.
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain("user_id = $1");
    expect(params).toEqual([USER_ID]);
  });
});

describe("GET /jobs/:id", () => {
  test("returns 404 when the job does not exist for this user", async () => {
    query.mockResolvedValueOnce(dbResult([]));

    const res = await request(app)
      .get(`/jobs/${JOB_ID}`)
      .set("Authorization", authHeader());

    expect(res.status).toBe(404);
  });
});

describe("POST /jobs", () => {
  test("returns 400 and skips the DB when no allowed fields are sent", async () => {
    const res = await request(app)
      .post("/jobs")
      .set("Authorization", authHeader())
      .send({ hacker_field: "x" });

    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  test("ignores a user_id in the body so nobody can create jobs for another user", async () => {
    query.mockResolvedValueOnce(dbResult([{ id: JOB_ID, company: "GM" }]));

    const res = await request(app)
      .post("/jobs")
      .set("Authorization", authHeader())
      .send({
        company: "GM",
        role: "AV Test Engineer",
        notes: "", // empty strings are dropped
        user_id: "33333333-3333-3333-3333-333333333333",
      });

    expect(res.status).toBe(201);
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('"company", "role"');
    expect(sql).not.toContain('"notes"');
    // $1 is always the user_id from the token, never from the body.
    expect(params).toEqual([USER_ID, "GM", "AV Test Engineer"]);
  });
});

describe("PATCH /jobs/:id", () => {
  // Regression test for 0e8eed7: an always-true includes guard rejected every
  // PATCH, so editing a job was impossible. A valid update must reach the DB.
  test("updates an allowed field and returns the updated row", async () => {
    query.mockResolvedValueOnce(dbResult([{ id: JOB_ID, status: "Interview" }]));

    const res = await request(app)
      .patch(`/jobs/${JOB_ID}`)
      .set("Authorization", authHeader())
      .send({ status: "Interview" });

    expect(res.status).toBe(200);
    expect(res.body.row.status).toBe("Interview");
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('"status" = $1');
    expect(params).toEqual(["Interview", JOB_ID, USER_ID]);
  });

  test("returns 404 when trying to edit a job owned by someone else", async () => {
    // WHERE id = .. AND user_id = .. matches nothing for another user's job.
    query.mockResolvedValueOnce(dbResult([]));

    const res = await request(app)
      .patch(`/jobs/${JOB_ID}`)
      .set("Authorization", authHeader())
      .send({ status: "Offer" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /jobs/:id", () => {
  test("returns 500 with a safe message when the database fails", async () => {
    query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app)
      .delete(`/jobs/${JOB_ID}`)
      .set("Authorization", authHeader());

    expect(res.status).toBe(500);
    // Internal error details must not leak to the client.
    expect(res.body).toEqual({ error: "Failed to delete job" });
  });
});
