"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAttemptSchema = exports.lessonIdParamsSchema = exports.courseIdParamsSchema = void 0;
const zod_1 = require("zod");
const learningConstants_1 = require("../config/learningConstants");
const UUID_SCHEMA = zod_1.z.string().uuid();
exports.courseIdParamsSchema = zod_1.z.object({
    courseId: UUID_SCHEMA,
});
exports.lessonIdParamsSchema = zod_1.z.object({
    lessonId: UUID_SCHEMA,
});
exports.submitAttemptSchema = zod_1.z.object({
    lessonId: UUID_SCHEMA,
    promptType: zod_1.z.string().trim().min(learningConstants_1.LEARNING_CONSTANTS.minAnswerLength).max(learningConstants_1.LEARNING_CONSTANTS.promptTypeMaxLength),
    sourceText: zod_1.z.string().trim().min(learningConstants_1.LEARNING_CONSTANTS.minAnswerLength).max(learningConstants_1.LEARNING_CONSTANTS.textFieldMaxLength),
    expectedAnswers: zod_1.z
        .array(zod_1.z.string().trim().min(learningConstants_1.LEARNING_CONSTANTS.minAnswerLength).max(learningConstants_1.LEARNING_CONSTANTS.textFieldMaxLength))
        .min(1),
    userAnswer: zod_1.z.string().trim().min(learningConstants_1.LEARNING_CONSTANTS.minAnswerLength).max(learningConstants_1.LEARNING_CONSTANTS.textFieldMaxLength),
});
