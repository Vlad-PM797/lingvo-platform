import { dbPool } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { logger } from "../utils/logger";

export interface CourseRecord {
  id: string;
  code: string;
  title: string;
  description: string;
}

export interface LessonSummaryRecord {
  id: string;
  course_id: string;
  code: string;
  title: string;
  description: string;
  ordinal: number;
}

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

export class CourseRepository {
  async getActiveCourses(): Promise<CourseRecord[]> {
    try {
      logger.info("db.courses.get_active.start");
      const queryResult = await dbPool.query<CourseRecord>(QUERY_ACTIVE_COURSES);
      logger.info("db.courses.get_active.success", { rowCount: queryResult.rowCount });
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

  async getActiveLessonsByCourseId(courseId: string): Promise<LessonSummaryRecord[]> {
    try {
      logger.info("db.lessons.get_active_by_course.start", { courseId });
      const queryResult = await dbPool.query<LessonSummaryRecord>(QUERY_ACTIVE_LESSONS_BY_COURSE, [courseId]);
      logger.info("db.lessons.get_active_by_course.success", { courseId, rowCount: queryResult.rowCount });
      return queryResult.rows;
    } catch (error) {
      logger.error("db.lessons.get_active_by_course.error", error, { courseId });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadLessons);
    }
  }
}

export const courseRepository = new CourseRepository();
