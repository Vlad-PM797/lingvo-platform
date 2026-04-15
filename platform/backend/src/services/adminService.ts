import { adminRepository } from "../repositories/adminRepository";

export class AdminService {
  async createCourse(adminUserId: string, input: { code: string; title: string; description?: string; isActive?: boolean }) {
    return adminRepository.createCourse(adminUserId, {
      code: input.code,
      title: input.title,
      description: input.description ?? "",
      isActive: input.isActive ?? true,
    });
  }

  async updateCourse(
    adminUserId: string,
    courseId: string,
    input: { code?: string; title?: string; description?: string; isActive?: boolean },
  ) {
    return adminRepository.updateCourse(adminUserId, courseId, {
      code: input.code,
      title: input.title,
      description: input.description,
      is_active: input.isActive,
    });
  }

  async deactivateCourse(adminUserId: string, courseId: string): Promise<void> {
    await adminRepository.deactivateCourse(adminUserId, courseId);
  }

  async createLesson(
    adminUserId: string,
    input: { courseId: string; code: string; title: string; description?: string; ordinal: number; isActive?: boolean },
  ) {
    return adminRepository.createLesson(adminUserId, {
      courseId: input.courseId,
      code: input.code,
      title: input.title,
      description: input.description ?? "",
      ordinal: input.ordinal,
      isActive: input.isActive ?? true,
    });
  }

  async updateLesson(
    adminUserId: string,
    lessonId: string,
    input: { code?: string; title?: string; description?: string; ordinal?: number; isActive?: boolean },
  ) {
    return adminRepository.updateLesson(adminUserId, lessonId, {
      code: input.code,
      title: input.title,
      description: input.description,
      ordinal: input.ordinal,
      is_active: input.isActive,
    });
  }

  async deactivateLesson(adminUserId: string, lessonId: string): Promise<void> {
    await adminRepository.deactivateLesson(adminUserId, lessonId);
  }

  async createWord(adminUserId: string, input: { lessonId: string; enText: string; uaText: string; ordinal: number }) {
    return adminRepository.createWord(adminUserId, input);
  }

  async updateWord(adminUserId: string, wordId: string, input: { enText?: string; uaText?: string; ordinal?: number }) {
    return adminRepository.updateWord(adminUserId, wordId, {
      en_text: input.enText,
      ua_text: input.uaText,
      ordinal: input.ordinal,
    });
  }

  async deleteWord(adminUserId: string, wordId: string): Promise<void> {
    await adminRepository.deleteWord(adminUserId, wordId);
  }

  async createPhrase(adminUserId: string, input: { lessonId: string; enText: string; uaText: string; ordinal: number }) {
    return adminRepository.createPhrase(adminUserId, input);
  }

  async updatePhrase(
    adminUserId: string,
    phraseId: string,
    input: { enText?: string; uaText?: string; ordinal?: number },
  ) {
    return adminRepository.updatePhrase(adminUserId, phraseId, {
      en_text: input.enText,
      ua_text: input.uaText,
      ordinal: input.ordinal,
    });
  }

  async deletePhrase(adminUserId: string, phraseId: string): Promise<void> {
    await adminRepository.deletePhrase(adminUserId, phraseId);
  }
}

export const adminService = new AdminService();
