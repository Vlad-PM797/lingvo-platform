"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonRepository = exports.LessonRepository = void 0;
const db_1 = require("../db");
const errorHandler_1 = require("../middleware/errorHandler");
const learningConstants_1 = require("../config/learningConstants");
const logger_1 = require("../utils/logger");
const QUERY_ACTIVE_LESSON_BY_ID = `
  SELECT id, course_id, code, title, description, ordinal
  FROM lessons
  WHERE id = $1 AND is_active = TRUE
  LIMIT 1
`;
const QUERY_ACTIVE_WORDS_BY_LESSON = `
  SELECT en_text, ua_text, ordinal
  FROM lesson_words
  WHERE lesson_id = $1
  ORDER BY ordinal ASC
`;
const QUERY_ACTIVE_PHRASES_BY_LESSON = `
  SELECT en_text, ua_text, ordinal
  FROM lesson_phrases
  WHERE lesson_id = $1
  ORDER BY ordinal ASC
`;
class LessonRepository {
    async findActiveLessonById(lessonId) {
        try {
            logger_1.logger.info("db.lessons.find_active_by_id.start", { lessonId });
            const queryResult = await db_1.dbPool.query(QUERY_ACTIVE_LESSON_BY_ID, [lessonId]);
            logger_1.logger.info("db.lessons.find_active_by_id.success", { lessonId, rowCount: queryResult.rowCount });
            return queryResult.rows[0] ?? null;
        }
        catch (error) {
            logger_1.logger.error("db.lessons.find_active_by_id.error", error, { lessonId });
            throw new errorHandler_1.HttpError(500, learningConstants_1.LEARNING_ERROR_MESSAGES.failedToReadLesson);
        }
    }
    async getWordsByLessonId(lessonId) {
        try {
            logger_1.logger.info("db.lesson_words.get_by_lesson_id.start", { lessonId });
            const queryResult = await db_1.dbPool.query(QUERY_ACTIVE_WORDS_BY_LESSON, [lessonId]);
            logger_1.logger.info("db.lesson_words.get_by_lesson_id.success", { lessonId, rowCount: queryResult.rowCount });
            return queryResult.rows;
        }
        catch (error) {
            logger_1.logger.error("db.lesson_words.get_by_lesson_id.error", error, { lessonId });
            throw new errorHandler_1.HttpError(500, learningConstants_1.LEARNING_ERROR_MESSAGES.failedToReadLesson);
        }
    }
    async getPhrasesByLessonId(lessonId) {
        try {
            logger_1.logger.info("db.lesson_phrases.get_by_lesson_id.start", { lessonId });
            const queryResult = await db_1.dbPool.query(QUERY_ACTIVE_PHRASES_BY_LESSON, [lessonId]);
            logger_1.logger.info("db.lesson_phrases.get_by_lesson_id.success", { lessonId, rowCount: queryResult.rowCount });
            return queryResult.rows;
        }
        catch (error) {
            logger_1.logger.error("db.lesson_phrases.get_by_lesson_id.error", error, { lessonId });
            throw new errorHandler_1.HttpError(500, learningConstants_1.LEARNING_ERROR_MESSAGES.failedToReadLesson);
        }
    }
}
exports.LessonRepository = LessonRepository;
exports.lessonRepository = new LessonRepository();
