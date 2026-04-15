"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.learningContentController = exports.LearningContentController = void 0;
const learningContentService_1 = require("../services/learningContentService");
const learningSchemas_1 = require("../schemas/learningSchemas");
const logger_1 = require("../utils/logger");
class LearningContentController {
    async getCourses(_request, response) {
        logger_1.logger.info("learning.content.get_courses.attempt");
        const courses = await learningContentService_1.learningContentService.getCoursesWithLessons();
        response.status(200).json({ courses });
    }
    async getLessonsByCourse(request, response) {
        const params = learningSchemas_1.courseIdParamsSchema.parse(request.params);
        logger_1.logger.info("learning.content.get_lessons_by_course.attempt", { courseId: params.courseId });
        const payload = await learningContentService_1.learningContentService.getLessonsByCourseId(params.courseId);
        response.status(200).json(payload);
    }
    async getLessonById(request, response) {
        const params = learningSchemas_1.lessonIdParamsSchema.parse(request.params);
        logger_1.logger.info("learning.content.get_lesson_by_id.attempt", { lessonId: params.lessonId });
        const lesson = await learningContentService_1.learningContentService.getLessonById(params.lessonId);
        response.status(200).json(lesson);
    }
}
exports.LearningContentController = LearningContentController;
exports.learningContentController = new LearningContentController();
