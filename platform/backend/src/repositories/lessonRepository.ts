import { dbPool } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { logger } from "../utils/logger";

export interface LessonRecord {
  id: string;
  course_id: string;
  code: string;
  title: string;
  description: string;
  ordinal: number;
}

export interface LessonWordRecord {
  en_text: string;
  it_text: string | null;
  target_text: string;
  ua_text: string;
  ordinal: number;
}

export interface LessonPhraseRecord {
  en_text: string;
  it_text: string | null;
  target_text: string;
  ua_text: string;
  ordinal: number;
}

const QUERY_ACTIVE_LESSON_BY_ID = `
  SELECT id, course_id, code, title, description, ordinal
  FROM lessons
  WHERE id = $1 AND is_active = TRUE
  LIMIT 1
`;

const QUERY_ACTIVE_WORDS_BY_LESSON = `
  SELECT
    en_text,
    it_text,
    CASE WHEN $2 = 'it' THEN COALESCE(NULLIF(it_text, ''), en_text) ELSE en_text END AS target_text,
    ua_text,
    ordinal
  FROM lesson_words
  WHERE lesson_id = $1
  ORDER BY ordinal ASC
`;

const QUERY_ACTIVE_PHRASES_BY_LESSON = `
  SELECT
    en_text,
    it_text,
    CASE WHEN $2 = 'it' THEN COALESCE(NULLIF(it_text, ''), en_text) ELSE en_text END AS target_text,
    ua_text,
    ordinal
  FROM lesson_phrases
  WHERE lesson_id = $1
  ORDER BY ordinal ASC
`;

export class LessonRepository {
  async findActiveLessonById(lessonId: string): Promise<LessonRecord | null> {
    try {
      logger.info("db.lessons.find_active_by_id.start", { lessonId });
      const queryResult = await dbPool.query<LessonRecord>(QUERY_ACTIVE_LESSON_BY_ID, [lessonId]);
      logger.info("db.lessons.find_active_by_id.success", { lessonId, rowCount: queryResult.rowCount });
      return queryResult.rows[0] ?? null;
    } catch (error) {
      logger.error("db.lessons.find_active_by_id.error", error, { lessonId });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadLesson);
    }
  }

  async getWordsByLessonId(lessonId: string, targetLang: "en" | "it"): Promise<LessonWordRecord[]> {
    try {
      logger.info("db.lesson_words.get_by_lesson_id.start", { lessonId, targetLang });
      const queryResult = await dbPool.query<LessonWordRecord>(QUERY_ACTIVE_WORDS_BY_LESSON, [lessonId, targetLang]);
      logger.info("db.lesson_words.get_by_lesson_id.success", { lessonId, targetLang, rowCount: queryResult.rowCount });
      return queryResult.rows;
    } catch (error) {
      logger.error("db.lesson_words.get_by_lesson_id.error", error, { lessonId, targetLang });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadLesson);
    }
  }

  async getPhrasesByLessonId(lessonId: string, targetLang: "en" | "it"): Promise<LessonPhraseRecord[]> {
    try {
      logger.info("db.lesson_phrases.get_by_lesson_id.start", { lessonId, targetLang });
      const queryResult = await dbPool.query<LessonPhraseRecord>(QUERY_ACTIVE_PHRASES_BY_LESSON, [lessonId, targetLang]);
      logger.info("db.lesson_phrases.get_by_lesson_id.success", { lessonId, targetLang, rowCount: queryResult.rowCount });
      return queryResult.rows;
    } catch (error) {
      logger.error("db.lesson_phrases.get_by_lesson_id.error", error, { lessonId, targetLang });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadLesson);
    }
  }
}

export const lessonRepository = new LessonRepository();
