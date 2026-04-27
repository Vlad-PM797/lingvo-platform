import test from "node:test";
import assert from "node:assert/strict";
import { computeCompletionStreakDaysUtc, normalizeLearningText, toUtcDateKey } from "./learningProgressUtils";

test("normalizeLearningText trims case and repeated whitespace", () => {
  assert.equal(normalizeLearningText("  Buongiorno   A   Tutti "), "buongiorno a tutti");
});

test("toUtcDateKey returns stable UTC date keys", () => {
  assert.equal(toUtcDateKey("2026-04-27T22:15:00.000Z"), "2026-04-27");
});

test("computeCompletionStreakDaysUtc counts consecutive completion days anchored to today", () => {
  const streak = computeCompletionStreakDaysUtc(
    [
      { completedAt: "2026-04-27T07:00:00.000Z" },
      { completedAt: "2026-04-26T10:00:00.000Z" },
      { completedAt: "2026-04-25T12:00:00.000Z" },
      { completedAt: null },
    ],
    new Date("2026-04-27T18:00:00.000Z"),
  );

  assert.equal(streak, 3);
});

test("computeCompletionStreakDaysUtc returns zero when chain does not include today or yesterday", () => {
  const streak = computeCompletionStreakDaysUtc(
    [{ completedAt: "2026-04-24T12:00:00.000Z" }],
    new Date("2026-04-27T18:00:00.000Z"),
  );

  assert.equal(streak, 0);
});
