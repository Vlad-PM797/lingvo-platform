"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.learningProgressController = exports.LearningProgressController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const learningSchemas_1 = require("../schemas/learningSchemas");
const learningProgressService_1 = require("../services/learningProgressService");
const learningConstants_1 = require("../config/learningConstants");
const logger_1 = require("../utils/logger");
class LearningProgressController {
    async submitAttempt(request, response) {
        if (!request.userId) {
            throw new errorHandler_1.HttpError(401, learningConstants_1.LEARNING_ERROR_MESSAGES.unauthorized);
        }
        const input = learningSchemas_1.submitAttemptSchema.parse(request.body);
        logger_1.logger.info("learning.progress.submit_attempt.attempt", {
            userId: request.userId,
            lessonId: input.lessonId,
            promptType: input.promptType,
        });
        const result = await learningProgressService_1.learningProgressService.submitAttempt({
            userId: request.userId,
            lessonId: input.lessonId,
            promptType: input.promptType,
            sourceText: input.sourceText,
            expectedAnswers: input.expectedAnswers,
            userAnswer: input.userAnswer,
        });
        response.status(201).json(result);
    }
    async getMyProgress(request, response) {
        if (!request.userId) {
            throw new errorHandler_1.HttpError(401, learningConstants_1.LEARNING_ERROR_MESSAGES.unauthorized);
        }
        logger_1.logger.info("learning.progress.get_my.attempt", { userId: request.userId });
        const progress = await learningProgressService_1.learningProgressService.getMyProgress(request.userId);
        response.status(200).json(progress);
    }
}
exports.LearningProgressController = LearningProgressController;
exports.learningProgressController = new LearningProgressController();
