import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpError } from "../middleware/errorHandler";
import { adminService } from "../services/adminService";
import {
  courseIdParamSchema,
  createCourseSchema,
  createLessonSchema,
  createPhraseSchema,
  createWordSchema,
  lessonIdParamSchema,
  phraseIdParamSchema,
  updateCourseSchema,
  updateLessonSchema,
  updatePhraseSchema,
  updateWordSchema,
  wordIdParamSchema,
  testersActivityQuerySchema,
} from "../schemas/adminSchemas";
import { logger } from "../utils/logger";

function requireAdminUserId(request: AuthenticatedRequest): string {
  if (!request.userId) {
    throw new HttpError(401, "Unauthorized request");
  }
  return request.userId;
}

export class AdminController {
  async createCourse(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const input = createCourseSchema.parse(request.body);
    logger.info("admin.create_course.attempt", { adminUserId, code: input.code });
    const created = await adminService.createCourse(adminUserId, input);
    response.status(201).json(created);
  }

  async updateCourse(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const params = courseIdParamSchema.parse(request.params);
    const input = updateCourseSchema.parse(request.body);
    logger.info("admin.update_course.attempt", { adminUserId, courseId: params.courseId });
    const updated = await adminService.updateCourse(adminUserId, params.courseId, input);
    response.status(200).json(updated);
  }

  async deactivateCourse(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const params = courseIdParamSchema.parse(request.params);
    logger.info("admin.deactivate_course.attempt", { adminUserId, courseId: params.courseId });
    await adminService.deactivateCourse(adminUserId, params.courseId);
    response.status(200).json({ success: true });
  }

  async createLesson(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const input = createLessonSchema.parse(request.body);
    logger.info("admin.create_lesson.attempt", { adminUserId, courseId: input.courseId, code: input.code });
    const created = await adminService.createLesson(adminUserId, input);
    response.status(201).json(created);
  }

  async updateLesson(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const params = lessonIdParamSchema.parse(request.params);
    const input = updateLessonSchema.parse(request.body);
    logger.info("admin.update_lesson.attempt", { adminUserId, lessonId: params.lessonId });
    const updated = await adminService.updateLesson(adminUserId, params.lessonId, input);
    response.status(200).json(updated);
  }

  async deactivateLesson(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const params = lessonIdParamSchema.parse(request.params);
    logger.info("admin.deactivate_lesson.attempt", { adminUserId, lessonId: params.lessonId });
    await adminService.deactivateLesson(adminUserId, params.lessonId);
    response.status(200).json({ success: true });
  }

  async createWord(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const input = createWordSchema.parse(request.body);
    logger.info("admin.create_word.attempt", { adminUserId, lessonId: input.lessonId });
    const created = await adminService.createWord(adminUserId, input);
    response.status(201).json(created);
  }

  async updateWord(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const params = wordIdParamSchema.parse(request.params);
    const input = updateWordSchema.parse(request.body);
    logger.info("admin.update_word.attempt", { adminUserId, wordId: params.wordId });
    const updated = await adminService.updateWord(adminUserId, params.wordId, input);
    response.status(200).json(updated);
  }

  async deleteWord(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const params = wordIdParamSchema.parse(request.params);
    logger.info("admin.delete_word.attempt", { adminUserId, wordId: params.wordId });
    await adminService.deleteWord(adminUserId, params.wordId);
    response.status(200).json({ success: true });
  }

  async createPhrase(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const input = createPhraseSchema.parse(request.body);
    logger.info("admin.create_phrase.attempt", { adminUserId, lessonId: input.lessonId });
    const created = await adminService.createPhrase(adminUserId, input);
    response.status(201).json(created);
  }

  async updatePhrase(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const params = phraseIdParamSchema.parse(request.params);
    const input = updatePhraseSchema.parse(request.body);
    logger.info("admin.update_phrase.attempt", { adminUserId, phraseId: params.phraseId });
    const updated = await adminService.updatePhrase(adminUserId, params.phraseId, input);
    response.status(200).json(updated);
  }

  async deletePhrase(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const params = phraseIdParamSchema.parse(request.params);
    logger.info("admin.delete_phrase.attempt", { adminUserId, phraseId: params.phraseId });
    await adminService.deletePhrase(adminUserId, params.phraseId);
    response.status(200).json({ success: true });
  }

  async getTestersActivity(request: AuthenticatedRequest, response: Response): Promise<void> {
    const adminUserId = requireAdminUserId(request);
    const query = testersActivityQuerySchema.parse(request.query);
    logger.info("admin.testers_activity.get.attempt", { adminUserId, hours: query.hours, limit: query.limit });
    const payload = await adminService.getTestersActivity(adminUserId, query);
    response.status(200).json(payload);
  }
}

export const adminController = new AdminController();
