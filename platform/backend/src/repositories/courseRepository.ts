import { dbPool } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { logger } from "../utils/logger";

export interface CourseRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  learning_language_code: string;
  translation_language_code: string;
}

export interface LessonSummaryRecord {
  id: string;
  course_id: string;
  code: string;
  title: string;
  description: string;
  ordinal: number;
  learning_language_code: string;
  translation_language_code: string;
}

const QUERY_ACTIVE_COURSES = `
  SELECT id, code, title, description, learning_language_code, translation_language_code
  FROM courses
  WHERE is_active = TRUE
    AND ($1::text IS NULL OR learning_language_code = $1)
    AND ($2::text IS NULL OR translation_language_code = $2)
  ORDER BY created_at ASC
`;

const QUERY_ACTIVE_LESSONS_BY_COURSE = `
  SELECT id, course_id, code, title, description, ordinal, learning_language_code, translation_language_code
  FROM lessons
  WHERE course_id = $1 AND is_active = TRUE
    AND ($2::text IS NULL OR learning_language_code = $2)
    AND ($3::text IS NULL OR translation_language_code = $3)
  ORDER BY ordinal ASC
`;

const QUERY_ACTIVE_COURSE_BY_ID = `
  SELECT id, code, title, description, learning_language_code, translation_language_code
  FROM courses
  WHERE id = $1 AND is_active = TRUE
  LIMIT 1
`;

interface LanguageFilterInput extends Record<string, unknown> {
  learningLanguage?: string;
  translationLanguage?: string;
}

export class CourseRepository {
  async getActiveCourses(filters: LanguageFilterInput = {}): Promise<CourseRecord[]> {
    try {
      logger.info("db.courses.get_active.start", filters);
      const queryResult = await dbPool.query<CourseRecord>(QUERY_ACTIVE_COURSES, [
        filters.learningLanguage ?? null,
        filters.translationLanguage ?? null,
      ]);
      logger.info("db.courses.get_active.success", { rowCount: queryResult.rowCount, ...filters });
      return queryResult.rows;
    } catch (error) {
      logger.error("db.courses.get_active.error", error);
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadCourses);
    }
  }

  async findActiveCourseById(courseId: string): Promise<CourseRecord | null> {
    try {
      logger.info("db.courses.find_active_by_id.start", { courseId });
      const queryResult = await dbPool.query<CourseRecord>(QUERY_ACTIVE_COURSE_BY_ID, [courseId]);
      logger.info("db.courses.find_active_by_id.success", { courseId, rowCount: queryResult.rowCount });
      return queryResult.rows[0] ?? null;
    } catch (error) {
      logger.error("db.courses.find_active_by_id.error", error, { courseId });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadCourses);
    }
  }

  async getActiveLessonsByCourseId(courseId: string, filters: LanguageFilterInput = {}): Promise<LessonSummaryRecord[]> {
    try {
      logger.info("db.lessons.get_active_by_course.start", { courseId, ...filters });
      const queryResult = await dbPool.query<LessonSummaryRecord>(QUERY_ACTIVE_LESSONS_BY_COURSE, [
        courseId,
        filters.learningLanguage ?? null,
        filters.translationLanguage ?? null,
      ]);
      logger.info("db.lessons.get_active_by_course.success", { courseId, rowCount: queryResult.rowCount, ...filters });
      return queryResult.rows;
    } catch (error) {
      logger.error("db.lessons.get_active_by_course.error", error, { courseId });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadLessons);
    }
  }
}

export const courseRepository = new CourseRepository();
