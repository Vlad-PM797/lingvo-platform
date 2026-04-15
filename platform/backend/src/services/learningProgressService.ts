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

    logger.info("learning.progress.get_my.success", {
      userId,
      lessonCount: byLesson.length,
      attemptsCount: totals.attemptsCount,
      correctCount: totals.correctCount,
      accuracyPercent: totalsAccuracyPercent,
      completedLessonsCount: totals.completedLessonsCount,
    });

    return {
      totals: {
        attemptsCount: totals.attemptsCount,
        correctCount: totals.correctCount,
        accuracyPercent: totalsAccuracyPercent,
        completedLessonsCount: totals.completedLessonsCount,
      },
      byLesson,
    };
  }
}

export const learningProgressService = new LearningProgressService();
