import { Request, Response } from "express";
import { learningContentService } from "../services/learningContentService";
import { courseIdParamsSchema, lessonContentQuerySchema, lessonIdParamsSchema } from "../schemas/learningSchemas";
import { logger } from "../utils/logger";

export class LearningContentController {
  async getCourses(_request: Request, response: Response): Promise<void> {
    logger.info("learning.content.get_courses.attempt");
    const courses = await learningContentService.getCoursesWithLessons();
    response.status(200).json({ courses });
  }

  async getLessonsByCourse(request: Request, response: Response): Promise<void> {
    const params = courseIdParamsSchema.parse(request.params);
    logger.info("learning.content.get_lessons_by_course.attempt", { courseId: params.courseId });
    const payload = await learningContentService.getLessonsByCourseId(params.courseId);
    response.status(200).json(payload);
  }

  async getLessonById(request: Request, response: Response): Promise<void> {
    const params = lessonIdParamsSchema.parse(request.params);
    const query = lessonContentQuerySchema.parse(request.query);
    logger.info("learning.content.get_lesson_by_id.attempt", { lessonId: params.lessonId, targetLang: query.targetLang });
    const lesson = await learningContentService.getLessonById(params.lessonId, query.targetLang);
    response.status(200).json(lesson);
  }
}

export const learningContentController = new LearningContentController();
