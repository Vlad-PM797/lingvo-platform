"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.learningProgressService = exports.LearningProgressService = void 0;
const lessonRepository_1 = require("../repositories/lessonRepository");
const progressRepository_1 = require("../repositories/progressRepository");
const learningConstants_1 = require("../config/learningConstants");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
function normalizeText(value) {
    return value.trim().toLowerCase().replace(learningConstants_1.LEARNING_CONSTANTS.comparisonWhitespacePattern, " ");
}
class LearningProgressService {
    async submitAttempt(input) {
        logger_1.logger.info("learning.attempt.submit.start", {
            userId: input.userId,
            lessonId: input.lessonId,
            promptType: input.promptType,
        });
        const lesson = await lessonRepository_1.lessonRepository.findActiveLessonById(input.lessonId);
        if (!lesson) {
            throw new errorHandler_1.HttpError(404, learningConstants_1.LEARNING_ERROR_MESSAGES.lessonNotFound);
        }
        const normalizedUserAnswer = normalizeText(input.userAnswer);
        const normalizedExpectedAnswers = input.expectedAnswers.map((answer) => normalizeText(answer));
        const matchedAnswer = normalizedExpectedAnswers.find((answer) => answer === normalizedUserAnswer);
        const isCorrect = Boolean(matchedAnswer);
        const updatedProgress = await progressRepository_1.progressRepository.recordAttemptAndUpdateProgress({
            userId: input.userId,
            lessonId: input.lessonId,
            promptType: input.promptType,
            sourceText: input.sourceText,
            expectedAnswer: input.expectedAnswers.join(" | "),
            userAnswer: input.userAnswer,
            isCorrect,
        });
        const accuracyPercent = Math.round((updatedProgress.correctCount / updatedProgress.attemptsCount) * 100);
        logger_1.logger.info("learning.attempt.submit.success", {
            userId: input.userId,
            lessonId: input.lessonId,
            isCorrect,
            attemptsCount: updatedProgress.attemptsCount,
            correctCount: updatedProgress.correctCount,
            accuracyPercent,
        });
        return {
            isCorrect,
            acceptedAnswer: matchedAnswer ?? normalizedExpectedAnswers[0],
            attemptsCount: updatedProgress.attemptsCount,
            correctCount: updatedProgress.correctCount,
            accuracyPercent,
        };
    }
    async getMyProgress(userId) {
        logger_1.logger.info("learning.progress.get_my.start", { userId });
        const progressRows = await progressRepository_1.progressRepository.getProgressByUserId(userId);
        const byLesson = progressRows.map((progressRow) => {
            const accuracyPercent = progressRow.attempts_count === 0
                ? 0
                : Math.round((progressRow.correct_count / progressRow.attempts_count) * 100);
            return {
                lessonId: progressRow.lesson_id,
                attemptsCount: progressRow.attempts_count,
                correctCount: progressRow.correct_count,
                accuracyPercent,
                completed: Boolean(progressRow.completed_at),
                completedAt: progressRow.completed_at,
            };
        });
        const totals = byLesson.reduce((accumulator, lessonProgress) => {
            return {
                attemptsCount: accumulator.attemptsCount + lessonProgress.attemptsCount,
                correctCount: accumulator.correctCount + lessonProgress.correctCount,
                completedLessonsCount: accumulator.completedLessonsCount + (lessonProgress.completed ? 1 : 0),
            };
        }, { attemptsCount: 0, correctCount: 0, completedLessonsCount: 0 });
        const totalsAccuracyPercent = totals.attemptsCount === 0
            ? 0
            : Math.round((totals.correctCount / totals.attemptsCount) * 100);
        logger_1.logger.info("learning.progress.get_my.success", {
            userId,
            lessonCount: byLesson.length,
            attemptsCount: totals.attemptsCount,
            correctCount: totals.correctCount,
            accuracyPercent: totalsAccuracyPercent,
            completedLessonsCount: totals.completedLessonsCount,
        });
        return {
            totals: {
                attemptsCount: totals.attemptsCount,
                correctCount: totals.correctCount,
                accuracyPercent: totalsAccuracyPercent,
                completedLessonsCount: totals.completedLessonsCount,
            },
            byLesson,
        };
    }
}
exports.LearningProgressService = LearningProgressService;
exports.learningProgressService = new LearningProgressService();
