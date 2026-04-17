import { courseRepository } from "../repositories/courseRepository";
import { lessonRepository } from "../repositories/lessonRepository";
import { progressRepository } from "../repositories/progressRepository";
import { LEARNING_CONSTANTS, LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { HttpError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

interface SubmitAttemptInput {
  userId: string;
  lessonId: string;
  promptType: string;
  sourceText: string;
  expectedAnswers: string[];
  userAnswer: string;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(LEARNING_CONSTANTS.comparisonWhitespacePattern, " ");
}

function toUtcDateKey(isoTimestamp: string): string {
  return new Date(isoTimestamp).toISOString().slice(0, 10);
}

/**
 * Підряд календарних днів (UTC), коли був хоча б один завершений урок; ланцюг має включати сьогодні або вчора.
 */
function computeCompletionStreakDaysUtc(
  byLesson: ReadonlyArray<{ completedAt: string | null }>,
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
  const now = new Date();
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

export class LearningProgressService {
  async submitAttempt(input: SubmitAttemptInput): Promise<{
    isCorrect: boolean;
    acceptedAnswer: string;
    attemptsCount: number;
    correctCount: number;
    accuracyPercent: number;
  }> {
    logger.info("learning.attempt.submit.start", {
      userId: input.userId,
      lessonId: input.lessonId,
      promptType: input.promptType,
    });

    const lesson = await lessonRepository.findActiveLessonById(input.lessonId);
    if (!lesson) {
      throw new HttpError(404, LEARNING_ERROR_MESSAGES.lessonNotFound);
    }

    const normalizedUserAnswer = normalizeText(input.userAnswer);
    const normalizedExpectedAnswers = input.expectedAnswers.map((answer) => normalizeText(answer));
    const matchedAnswer = normalizedExpectedAnswers.find((answer) => answer === normalizedUserAnswer);
    const isCorrect = Boolean(matchedAnswer);

    const updatedProgress = await progressRepository.recordAttemptAndUpdateProgress({
      userId: input.userId,
      lessonId: input.lessonId,
      promptType: input.promptType,
      sourceText: input.sourceText,
      expectedAnswer: input.expectedAnswers.join(" | "),
      userAnswer: input.userAnswer,
      isCorrect,
    });

    const accuracyPercent = Math.round((updatedProgress.correctCount / updatedProgress.attemptsCount) * 100);
    logger.info("learning.attempt.submit.success", {
      userId: input.userId,
      lessonId: input.lessonId,
      isCorrect,
      attemptsCount: updatedProgress.attemptsCount,
      correctCount: updatedProgress.correctCount,
      accuracyPercent,
    });

    return {
      isCorrect,
      acceptedAnswer: matchedAnswer ?? normalizedExpectedAnswers[0],
      attemptsCount: updatedProgress.attemptsCount,
      correctCount: updatedProgress.correctCount,
      accuracyPercent,
    };
  }

  async getMyProgress(userId: string): Promise<{
    totals: {
      attemptsCount: number;
      correctCount: number;
      accuracyPercent: number;
      completedLessonsCount: number;
    };
    byLesson: Array<{
      lessonId: string;
      attemptsCount: number;
      correctCount: number;
      accuracyPercent: number;
      completed: boolean;
      completedAt: string | null;
    }>;
    streakDays: number;
    spotlightLesson: {
      lessonId: string;
      title: string;
      courseTitle: string;
      ordinal: number;
      accuracyPercent: number;
      completed: boolean;
      attemptsCount: number;
    } | null;
  }> {
    logger.info("learning.progress.get_my.start", { userId });
    const progressRows = await progressRepository.getProgressByUserId(userId);

    const byLesson = progressRows.map((progressRow) => {
      const accuracyPercent = progressRow.attempts_count === 0
        ? 0
        : Math.round((progressRow.correct_count / progressRow.attempts_count) * 100);

      return {
        lessonId: progressRow.lesson_id,
        attemptsCount: progressRow.attempts_count,
        correctCount: progressRow.correct_count,
        accuracyPercent,
        completed: Boolean(progressRow.completed_at),
        completedAt: progressRow.completed_at,
      };
    });

    const totals = byLesson.reduce(
      (accumulator, lessonProgress) => {
        return {
          attemptsCount: accumulator.attemptsCount + lessonProgress.attemptsCount,
          correctCount: accumulator.correctCount + lessonProgress.correctCount,
          completedLessonsCount: accumulator.completedLessonsCount + (lessonProgress.completed ? 1 : 0),
        };
      },
      { attemptsCount: 0, correctCount: 0, completedLessonsCount: 0 },
    );

    const totalsAccuracyPercent = totals.attemptsCount === 0
      ? 0
      : Math.round((totals.correctCount / totals.attemptsCount) * 100);

    const streakDays = computeCompletionStreakDaysUtc(byLesson);

    let spotlightLesson: {
      lessonId: string;
      title: string;
      courseTitle: string;
      ordinal: number;
      accuracyPercent: number;
      completed: boolean;
      attemptsCount: number;
    } | null = null;
    const primaryLessonProgress = byLesson[0];
    if (primaryLessonProgress) {
      try {
        const lessonRecord = await lessonRepository.findActiveLessonById(primaryLessonProgress.lessonId);
        if (lessonRecord) {
          const courseRecord = await courseRepository.findActiveCourseById(lessonRecord.course_id);
          spotlightLesson = {
            lessonId: primaryLessonProgress.lessonId,
            title: lessonRecord.title,
            courseTitle: courseRecord?.title ?? "",
            ordinal: lessonRecord.ordinal,
            accuracyPercent: primaryLessonProgress.accuracyPercent,
            completed: primaryLessonProgress.completed,
            attemptsCount: primaryLessonProgress.attemptsCount,
          };
        }
      } catch (error) {
        logger.error("learning.progress.spotlight.resolve.failed", error, {
          userId,
          lessonId: primaryLessonProgress.lessonId,
        });
      }
    }

    logger.info("learning.progress.get_my.success", {
      userId,
      lessonCount: byLesson.length,
      attemptsCount: totals.attemptsCount,
      correctCount: totals.correctCount,
      accuracyPercent: totalsAccuracyPercent,
      completedLessonsCount: totals.completedLessonsCount,
      streakDays,
      hasSpotlight: Boolean(spotlightLesson),
    });

    return {
      totals: {
        attemptsCount: totals.attemptsCount,
        correctCount: totals.correctCount,
        accuracyPercent: totalsAccuracyPercent,
        completedLessonsCount: totals.completedLessonsCount,
      },
      byLesson,
      streakDays,
      spotlightLesson,
    };
  }
}

export const learningProgressService = new LearningProgressService();
