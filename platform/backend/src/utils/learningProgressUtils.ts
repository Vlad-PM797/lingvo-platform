import { LEARNING_CONSTANTS } from "../config/learningConstants";

export function normalizeLearningText(value: string): string {
  return value.trim().toLowerCase().replace(LEARNING_CONSTANTS.comparisonWhitespacePattern, " ");
}

export function toUtcDateKey(isoTimestamp: string): string {
  return new Date(isoTimestamp).toISOString().slice(0, 10);
}

export function computeCompletionStreakDaysUtc(
  byLesson: ReadonlyArray<{ completedAt: string | null }>,
  now = new Date(),
): number {
  const completionDayKeys = new Set<string>();
  for (const row of byLesson) {
    if (row.completedAt) {
      completionDayKeys.add(toUtcDateKey(row.completedAt));
    }
  }
  if (completionDayKeys.size === 0) {
    return 0;
  }

  const todayKey = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  let anchorKey: string;
  if (completionDayKeys.has(todayKey)) {
    anchorKey = todayKey;
  } else if (completionDayKeys.has(yesterdayKey)) {
    anchorKey = yesterdayKey;
  } else {
    return 0;
  }

  let streak = 0;
  const cursor = new Date(`${anchorKey}T12:00:00.000Z`);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!completionDayKeys.has(key)) {
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
