"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseRepository = exports.CourseRepository = void 0;
const db_1 = require("../db");
const errorHandler_1 = require("../middleware/errorHandler");
const learningConstants_1 = require("../config/learningConstants");
const logger_1 = require("../utils/logger");
const QUERY_ACTIVE_COURSES = `
  SELECT id, code, title, description
  FROM courses
  WHERE is_active = TRUE
  ORDER BY created_at ASC
`;
const QUERY_ACTIVE_LESSONS_BY_COURSE = `
  SELECT id, course_id, code, title, description, ordinal
  FROM lessons
  WHERE course_id = $1 AND is_active = TRUE
  ORDER BY ordinal ASC
`;
const QUERY_ACTIVE_COURSE_BY_ID = `
  SELECT id, code, title, description
  FROM courses
  WHERE id = $1 AND is_active = TRUE
  LIMIT 1
`;
class CourseRepository {
    async getActiveCourses() {
        try {
            logger_1.logger.info("db.courses.get_active.start");
            const queryResult = await db_1.dbPool.query(QUERY_ACTIVE_COURSES);
            logger_1.logger.info("db.courses.get_active.success", { rowCount: queryResult.rowCount });
            return queryResult.rows;
        }
        catch (error) {
            logger_1.logger.error("db.courses.get_active.error", error);
            throw new errorHandler_1.HttpError(500, learningConstants_1.LEARNING_ERROR_MESSAGES.failedToReadCourses);
        }
    }
    async findActiveCourseById(courseId) {
        try {
            logger_1.logger.info("db.courses.find_active_by_id.start", { courseId });
            const queryResult = await db_1.dbPool.query(QUERY_ACTIVE_COURSE_BY_ID, [courseId]);
            logger_1.logger.info("db.courses.find_active_by_id.success", { courseId, rowCount: queryResult.rowCount });
            return queryResult.rows[0] ?? null;
        }
        catch (error) {
            logger_1.logger.error("db.courses.find_active_by_id.error", error, { courseId });
            throw new errorHandler_1.HttpError(500, learningConstants_1.LEARNING_ERROR_MESSAGES.failedToReadCourses);
        }
    }
    async getActiveLessonsByCourseId(courseId) {
        try {
            logger_1.logger.info("db.lessons.get_active_by_course.start", { courseId });
            const queryResult = await db_1.dbPool.query(QUERY_ACTIVE_LESSONS_BY_COURSE, [courseId]);
            logger_1.logger.info("db.lessons.get_active_by_course.success", { courseId, rowCount: queryResult.rowCount });
            return queryResult.rows;
        }
        catch (error) {
            logger_1.logger.error("db.lessons.get_active_by_course.error", error, { courseId });
            throw new errorHandler_1.HttpError(500, learningConstants_1.LEARNING_ERROR_MESSAGES.failedToReadLessons);
        }
    }
}
exports.CourseRepository = CourseRepository;
exports.courseRepository = new CourseRepository();
