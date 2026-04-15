"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phraseIdParamSchema = exports.wordIdParamSchema = exports.lessonIdParamSchema = exports.courseIdParamSchema = exports.updatePhraseSchema = exports.createPhraseSchema = exports.updateWordSchema = exports.createWordSchema = exports.updateLessonSchema = exports.createLessonSchema = exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
const adminConstants_1 = require("../config/adminConstants");
const UUID_SCHEMA = zod_1.z.string().uuid();
const OPTIONAL_DESCRIPTION = zod_1.z.string().trim().max(adminConstants_1.ADMIN_CONSTANTS.descriptionMaxLength).optional();
exports.createCourseSchema = zod_1.z.object({
    code: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.codeMaxLength),
    title: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.titleMaxLength),
    description: OPTIONAL_DESCRIPTION,
    isActive: zod_1.z.boolean().optional(),
});
exports.updateCourseSchema = zod_1.z.object({
    code: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.codeMaxLength).optional(),
    title: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.titleMaxLength).optional(),
    description: OPTIONAL_DESCRIPTION,
    isActive: zod_1.z.boolean().optional(),
});
exports.createLessonSchema = zod_1.z.object({
    courseId: UUID_SCHEMA,
    code: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.codeMaxLength),
    title: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.titleMaxLength),
    description: OPTIONAL_DESCRIPTION,
    ordinal: zod_1.z.number().int().min(adminConstants_1.ADMIN_CONSTANTS.minOrdinal),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateLessonSchema = zod_1.z.object({
    code: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.codeMaxLength).optional(),
    title: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.titleMaxLength).optional(),
    description: OPTIONAL_DESCRIPTION,
    ordinal: zod_1.z.number().int().min(adminConstants_1.ADMIN_CONSTANTS.minOrdinal).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createWordSchema = zod_1.z.object({
    lessonId: UUID_SCHEMA,
    enText: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.textMaxLength),
    uaText: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.textMaxLength),
    ordinal: zod_1.z.number().int().min(adminConstants_1.ADMIN_CONSTANTS.minOrdinal),
});
exports.updateWordSchema = zod_1.z.object({
    enText: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.textMaxLength).optional(),
    uaText: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.textMaxLength).optional(),
    ordinal: zod_1.z.number().int().min(adminConstants_1.ADMIN_CONSTANTS.minOrdinal).optional(),
});
exports.createPhraseSchema = zod_1.z.object({
    lessonId: UUID_SCHEMA,
    enText: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.textMaxLength),
    uaText: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.textMaxLength),
    ordinal: zod_1.z.number().int().min(adminConstants_1.ADMIN_CONSTANTS.minOrdinal),
});
exports.updatePhraseSchema = zod_1.z.object({
    enText: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.textMaxLength).optional(),
    uaText: zod_1.z.string().trim().min(1).max(adminConstants_1.ADMIN_CONSTANTS.textMaxLength).optional(),
    ordinal: zod_1.z.number().int().min(adminConstants_1.ADMIN_CONSTANTS.minOrdinal).optional(),
});
exports.courseIdParamSchema = zod_1.z.object({ courseId: UUID_SCHEMA });
exports.lessonIdParamSchema = zod_1.z.object({ lessonId: UUID_SCHEMA });
exports.wordIdParamSchema = zod_1.z.object({ wordId: UUID_SCHEMA });
exports.phraseIdParamSchema = zod_1.z.object({ phraseId: UUID_SCHEMA });
