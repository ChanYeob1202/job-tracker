import { describe, test, expect } from "vitest";
import { getTokenExp } from "./auth";

// A JWT is three base64 parts joined by dots: header.payload.signature
// getTokenExp only reads the middle (payload) part, so we fake a token by
// base64-encoding a payload object and wrapping it with dummy header/signature.

function makeToken(payload: object): string {
  const fakePayload = btoa(JSON.stringify(payload));
  return `header.${fakePayload}.signature`;
}

describe("getTokenExp", () => {
  test("returns the exp claim converted to milliseconds", () => {
    // exp is in seconds (1000), so we expect milliseconds (1000 * 1000)
    const token = makeToken({ exp: 1000 });
    expect(getTokenExp(token)).toBe(1_000_000);
  });
});

describe("getTokenExp", () => {
  test ("returns the exp claim to null", () => {
    const token = "aefaefeasfaeesfesfeasf"
    expect(getTokenExp(token)).toBe(null)
  })
})
