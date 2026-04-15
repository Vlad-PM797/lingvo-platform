"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const adminRepository_1 = require("../repositories/adminRepository");
class AdminService {
    async createCourse(adminUserId, input) {
        return adminRepository_1.adminRepository.createCourse(adminUserId, {
            code: input.code,
            title: input.title,
            description: input.description ?? "",
            isActive: input.isActive ?? true,
        });
    }
    async updateCourse(adminUserId, courseId, input) {
        return adminRepository_1.adminRepository.updateCourse(adminUserId, courseId, {
            code: input.code,
            title: input.title,
            description: input.description,
            is_active: input.isActive,
        });
    }
    async deactivateCourse(adminUserId, courseId) {
        await adminRepository_1.adminRepository.deactivateCourse(adminUserId, courseId);
    }
    async createLesson(adminUserId, input) {
        return adminRepository_1.adminRepository.createLesson(adminUserId, {
            courseId: input.courseId,
            code: input.code,
            title: input.title,
            description: input.description ?? "",
            ordinal: input.ordinal,
            isActive: input.isActive ?? true,
        });
    }
    async updateLesson(adminUserId, lessonId, input) {
        return adminRepository_1.adminRepository.updateLesson(adminUserId, lessonId, {
            code: input.code,
            title: input.title,
            description: input.description,
            ordinal: input.ordinal,
            is_active: input.isActive,
        });
    }
    async deactivateLesson(adminUserId, lessonId) {
        await adminRepository_1.adminRepository.deactivateLesson(adminUserId, lessonId);
    }
    async createWord(adminUserId, input) {
        return adminRepository_1.adminRepository.createWord(adminUserId, input);
    }
    async updateWord(adminUserId, wordId, input) {
        return adminRepository_1.adminRepository.updateWord(adminUserId, wordId, {
            en_text: input.enText,
            ua_text: input.uaText,
            ordinal: input.ordinal,
        });
    }
    async deleteWord(adminUserId, wordId) {
        await adminRepository_1.adminRepository.deleteWord(adminUserId, wordId);
    }
    async createPhrase(adminUserId, input) {
        return adminRepository_1.adminRepository.createPhrase(adminUserId, input);
    }
    async updatePhrase(adminUserId, phraseId, input) {
        return adminRepository_1.adminRepository.updatePhrase(adminUserId, phraseId, {
            en_text: input.enText,
            ua_text: input.uaText,
            ordinal: input.ordinal,
        });
    }
    async deletePhrase(adminUserId, phraseId) {
        await adminRepository_1.adminRepository.deletePhrase(adminUserId, phraseId);
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
