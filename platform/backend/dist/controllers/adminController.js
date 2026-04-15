"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const adminService_1 = require("../services/adminService");
const adminSchemas_1 = require("../schemas/adminSchemas");
const logger_1 = require("../utils/logger");
function requireAdminUserId(request) {
    if (!request.userId) {
        throw new errorHandler_1.HttpError(401, "Unauthorized request");
    }
    return request.userId;
}
class AdminController {
    async createCourse(request, response) {
        const adminUserId = requireAdminUserId(request);
        const input = adminSchemas_1.createCourseSchema.parse(request.body);
        logger_1.logger.info("admin.create_course.attempt", { adminUserId, code: input.code });
        const created = await adminService_1.adminService.createCourse(adminUserId, input);
        response.status(201).json(created);
    }
    async updateCourse(request, response) {
        const adminUserId = requireAdminUserId(request);
        const params = adminSchemas_1.courseIdParamSchema.parse(request.params);
        const input = adminSchemas_1.updateCourseSchema.parse(request.body);
        logger_1.logger.info("admin.update_course.attempt", { adminUserId, courseId: params.courseId });
        const updated = await adminService_1.adminService.updateCourse(adminUserId, params.courseId, input);
        response.status(200).json(updated);
    }
    async deactivateCourse(request, response) {
        const adminUserId = requireAdminUserId(request);
        const params = adminSchemas_1.courseIdParamSchema.parse(request.params);
        logger_1.logger.info("admin.deactivate_course.attempt", { adminUserId, courseId: params.courseId });
        await adminService_1.adminService.deactivateCourse(adminUserId, params.courseId);
        response.status(200).json({ success: true });
    }
    async createLesson(request, response) {
        const adminUserId = requireAdminUserId(request);
        const input = adminSchemas_1.createLessonSchema.parse(request.body);
        logger_1.logger.info("admin.create_lesson.attempt", { adminUserId, courseId: input.courseId, code: input.code });
        const created = await adminService_1.adminService.createLesson(adminUserId, input);
        response.status(201).json(created);
    }
    async updateLesson(request, response) {
        const adminUserId = requireAdminUserId(request);
        const params = adminSchemas_1.lessonIdParamSchema.parse(request.params);
        const input = adminSchemas_1.updateLessonSchema.parse(request.body);
        logger_1.logger.info("admin.update_lesson.attempt", { adminUserId, lessonId: params.lessonId });
        const updated = await adminService_1.adminService.updateLesson(adminUserId, params.lessonId, input);
        response.status(200).json(updated);
    }
    async deactivateLesson(request, response) {
        const adminUserId = requireAdminUserId(request);
        const params = adminSchemas_1.lessonIdParamSchema.parse(request.params);
        logger_1.logger.info("admin.deactivate_lesson.attempt", { adminUserId, lessonId: params.lessonId });
        await adminService_1.adminService.deactivateLesson(adminUserId, params.lessonId);
        response.status(200).json({ success: true });
    }
    async createWord(request, response) {
        const adminUserId = requireAdminUserId(request);
        const input = adminSchemas_1.createWordSchema.parse(request.body);
        logger_1.logger.info("admin.create_word.attempt", { adminUserId, lessonId: input.lessonId });
        const created = await adminService_1.adminService.createWord(adminUserId, input);
        response.status(201).json(created);
    }
    async updateWord(request, response) {
        const adminUserId = requireAdminUserId(request);
        const params = adminSchemas_1.wordIdParamSchema.parse(request.params);
        const input = adminSchemas_1.updateWordSchema.parse(request.body);
        logger_1.logger.info("admin.update_word.attempt", { adminUserId, wordId: params.wordId });
        const updated = await adminService_1.adminService.updateWord(adminUserId, params.wordId, input);
        response.status(200).json(updated);
    }
    async deleteWord(request, response) {
        const adminUserId = requireAdminUserId(request);
        const params = adminSchemas_1.wordIdParamSchema.parse(request.params);
        logger_1.logger.info("admin.delete_word.attempt", { adminUserId, wordId: params.wordId });
        await adminService_1.adminService.deleteWord(adminUserId, params.wordId);
        response.status(200).json({ success: true });
    }
    async createPhrase(request, response) {
        const adminUserId = requireAdminUserId(request);
        const input = adminSchemas_1.createPhraseSchema.parse(request.body);
        logger_1.logger.info("admin.create_phrase.attempt", { adminUserId, lessonId: input.lessonId });
        const created = await adminService_1.adminService.createPhrase(adminUserId, input);
        response.status(201).json(created);
    }
    async updatePhrase(request, response) {
        const adminUserId = requireAdminUserId(request);
        const params = adminSchemas_1.phraseIdParamSchema.parse(request.params);
        const input = adminSchemas_1.updatePhraseSchema.parse(request.body);
        logger_1.logger.info("admin.update_phrase.attempt", { adminUserId, phraseId: params.phraseId });
        const updated = await adminService_1.adminService.updatePhrase(adminUserId, params.phraseId, input);
        response.status(200).json(updated);
    }
    async deletePhrase(request, response) {
        const adminUserId = requireAdminUserId(request);
        const params = adminSchemas_1.phraseIdParamSchema.parse(request.params);
        logger_1.logger.info("admin.delete_phrase.attempt", { adminUserId, phraseId: params.phraseId });
        await adminService_1.adminService.deletePhrase(adminUserId, params.phraseId);
        response.status(200).json({ success: true });
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
