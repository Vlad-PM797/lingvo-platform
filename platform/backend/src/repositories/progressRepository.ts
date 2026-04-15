import { PoolClient } from "pg";
import { dbPool } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { LEARNING_CONSTANTS, LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { logger } from "../utils/logger";

export interface ProgressAggregateRecord {
  lesson_id: string;
  attempts_count: number;
  correct_count: number;
  completed_at: string | null;
}

interface UpsertedProgressRecord {
  attempts_count: number;
  correct_count: number;
}

const QUERY_INSERT_ATTEMPT = `
  INSERT INTO user_attempts (
    user_id, lesson_id, prompt_type, source_text, expected_answer, user_answer, is_correct
  ) VALUES ($1, $2, $3, $4, $5, $6, $7)
`;

const QUERY_UPSERT_PROGRESS = `
  INSERT INTO user_progress (user_id, lesson_id, attempts_count, correct_count, completed_at, updated_at)
  VALUES ($1, $2, 1, CASE WHEN $3 THEN 1 ELSE 0 END, CASE WHEN $3 THEN NOW() ELSE NULL END, NOW())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    attempts_count = user_progress.attempts_count + 1,
    correct_count = user_progress.correct_count + CASE WHEN EXCLUDED.correct_count = 1 THEN 1 ELSE 0 END,
    completed_at = CASE
      WHEN user_progress.completed_at IS NOT NULL THEN user_progress.completed_at
      WHEN ((user_progress.correct_count + CASE WHEN EXCLUDED.correct_count = 1 THEN 1 ELSE 0 END) * 100.0)
           / NULLIF(user_progress.attempts_count + 1, 0) >= $4
      THEN NOW()
      ELSE NULL
    END,
    updated_at = NOW()
  RETURNING attempts_count, correct_count
`;

const QUERY_SELECT_PROGRESS_BY_USER = `
  SELECT lesson_id, attempts_count, correct_count, completed_at
  FROM user_progress
  WHERE user_id = $1
  ORDER BY updated_at DESC
`;

export class ProgressRepository {
  async recordAttemptAndUpdateProgress(input: {
    userId: string;
    lessonId: string;
    promptType: string;
    sourceText: string;
    expectedAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
  }): Promise<{ attemptsCount: number; correctCount: number }> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.progress.record_attempt.start", { userId: input.userId, lessonId: input.lessonId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      await databaseClient.query(QUERY_INSERT_ATTEMPT, [
        input.userId,
        input.lessonId,
        input.promptType,
        input.sourceText,
        input.expectedAnswer,
        input.userAnswer,
        input.isCorrect,
      ]);
      const upsertResult = await databaseClient.query<UpsertedProgressRecord>(QUERY_UPSERT_PROGRESS, [
        input.userId,
        input.lessonId,
        input.isCorrect,
        LEARNING_CONSTANTS.completionTargetPercent,
      ]);
      await databaseClient.query("COMMIT");
      logger.info("db.progress.record_attempt.success", {
        userId: input.userId,
        lessonId: input.lessonId,
        attemptsCount: upsertResult.rows[0].attempts_count,
        correctCount: upsertResult.rows[0].correct_count,
      });
      return {
        attemptsCount: upsertResult.rows[0].attempts_count,
        correctCount: upsertResult.rows[0].correct_count,
      };
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      logger.error("db.progress.record_attempt.error", error, { userId: input.userId, lessonId: input.lessonId });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToSaveAttempt);
    } finally {
      databaseClient?.release();
    }
  }

  async getProgressByUserId(userId: string): Promise<ProgressAggregateRecord[]> {
    try {
      logger.info("db.progress.get_by_user_id.start", { userId });
      const queryResult = await dbPool.query<ProgressAggregateRecord>(QUERY_SELECT_PROGRESS_BY_USER, [userId]);
      logger.info("db.progress.get_by_user_id.success", { userId, rowCount: queryResult.rowCount });
      return queryResult.rows;
    } catch (error) {
      logger.error("db.progress.get_by_user_id.error", error, { userId });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadProgress);
    }
  }
}

export const progressRepository = new ProgressRepository();
