import test from "node:test";
import assert from "node:assert/strict";
import { parseAccessTtlToSeconds } from "./authTokenUtils";

test("parseAccessTtlToSeconds supports raw seconds", () => {
  assert.equal(parseAccessTtlToSeconds("900"), 900);
});

test("parseAccessTtlToSeconds supports minutes hours and days", () => {
  assert.equal(parseAccessTtlToSeconds("15m"), 900);
  assert.equal(parseAccessTtlToSeconds("2h"), 7200);
  assert.equal(parseAccessTtlToSeconds("3d"), 259200);
});

test("parseAccessTtlToSeconds falls back for invalid values", () => {
  assert.equal(parseAccessTtlToSeconds("weird"), 900);
});
