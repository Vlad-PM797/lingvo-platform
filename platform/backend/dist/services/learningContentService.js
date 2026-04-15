"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.learningContentService = exports.LearningContentService = void 0;
const learningConstants_1 = require("../config/learningConstants");
const errorHandler_1 = require("../middleware/errorHandler");
const courseRepository_1 = require("../repositories/courseRepository");
const lessonRepository_1 = require("../repositories/lessonRepository");
class LearningContentService {
    async getCoursesWithLessons() {
        const courses = await courseRepository_1.courseRepository.getActiveCourses();
        return Promise.all(courses.map(async (course) => {
            const lessons = await courseRepository_1.courseRepository.getActiveLessonsByCourseId(course.id);
            return {
                id: course.id,
                code: course.code,
                title: course.title,
                description: course.description,
                lessons: lessons.map((lesson) => ({
                    id: lesson.id,
                    code: lesson.code,
                    title: lesson.title,
                    description: lesson.description,
                    ordinal: lesson.ordinal,
                })),
            };
        }));
    }
    async getLessonsByCourseId(courseId) {
        const course = await courseRepository_1.courseRepository.findActiveCourseById(courseId);
        if (!course) {
            throw new errorHandler_1.HttpError(404, learningConstants_1.LEARNING_ERROR_MESSAGES.courseNotFound);
        }
        const lessons = await courseRepository_1.courseRepository.getActiveLessonsByCourseId(courseId);
        return {
            course: {
                id: course.id,
                code: course.code,
                title: course.title,
                description: course.description,
            },
            lessons: lessons.map((lesson) => ({
                id: lesson.id,
                code: lesson.code,
                title: lesson.title,
                description: lesson.description,
                ordinal: lesson.ordinal,
            })),
        };
    }
    async getLessonById(lessonId) {
        const lesson = await lessonRepository_1.lessonRepository.findActiveLessonById(lessonId);
        if (!lesson) {
            throw new errorHandler_1.HttpError(404, learningConstants_1.LEARNING_ERROR_MESSAGES.lessonNotFound);
        }
        const [words, phrases] = await Promise.all([
            lessonRepository_1.lessonRepository.getWordsByLessonId(lessonId),
            lessonRepository_1.lessonRepository.getPhrasesByLessonId(lessonId),
        ]);
        return {
            id: lesson.id,
            code: lesson.code,
            title: lesson.title,
            description: lesson.description,
            ordinal: lesson.ordinal,
            courseId: lesson.course_id,
            words: words.map((word) => ({ en: word.en_text, ua: word.ua_text, ordinal: word.ordinal })),
            phrases: phrases.map((phrase) => ({ en: phrase.en_text, ua: phrase.ua_text, ordinal: phrase.ordinal })),
        };
    }
}
exports.LearningContentService = LearningContentService;
exports.learningContentService = new LearningContentService();
