import { Request, Response } from "express";
import { learningContentService } from "../services/learningContentService";
import { courseIdParamsSchema, learningContentQuerySchema, lessonIdParamsSchema } from "../schemas/learningSchemas";
import { logger } from "../utils/logger";

export class LearningContentController {
  async getCourses(request: Request, response: Response): Promise<void> {
    const query = learningContentQuerySchema.parse(request.query);
    logger.info("learning.content.get_courses.attempt", query);
    const courses = await learningContentService.getCoursesWithLessons(query);
    response.status(200).json({ courses });
  }

  async getLessonsByCourse(request: Request, response: Response): Promise<void> {
    const params = courseIdParamsSchema.parse(request.params);
    const query = learningContentQuerySchema.parse(request.query);
    logger.info("learning.content.get_lessons_by_course.attempt", { courseId: params.courseId, ...query });
    const payload = await learningContentService.getLessonsByCourseId(params.courseId, query);
    response.status(200).json(payload);
  }

  async getLessonById(request: Request, response: Response): Promise<void> {
    const params = lessonIdParamsSchema.parse(request.params);
    logger.info("learning.content.get_lesson_by_id.attempt", { lessonId: params.lessonId });
    const lesson = await learningContentService.getLessonById(params.lessonId);
    response.status(200).json(lesson);
  }
}

export const learningContentController = new LearningContentController();
