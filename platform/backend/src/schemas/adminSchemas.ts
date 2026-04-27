import { z } from "zod";
import { ADMIN_CONSTANTS } from "../config/adminConstants";

const UUID_SCHEMA = z.string().uuid();

const OPTIONAL_DESCRIPTION = z.string().trim().max(ADMIN_CONSTANTS.descriptionMaxLength).optional();

export const createCourseSchema = z.object({
  code: z.string().trim().min(1).max(ADMIN_CONSTANTS.codeMaxLength),
  title: z.string().trim().min(1).max(ADMIN_CONSTANTS.titleMaxLength),
  description: OPTIONAL_DESCRIPTION,
  isActive: z.boolean().optional(),
});

export const updateCourseSchema = z.object({
  code: z.string().trim().min(1).max(ADMIN_CONSTANTS.codeMaxLength).optional(),
  title: z.string().trim().min(1).max(ADMIN_CONSTANTS.titleMaxLength).optional(),
  description: OPTIONAL_DESCRIPTION,
  isActive: z.boolean().optional(),
});

export const createLessonSchema = z.object({
  courseId: UUID_SCHEMA,
  code: z.string().trim().min(1).max(ADMIN_CONSTANTS.codeMaxLength),
  title: z.string().trim().min(1).max(ADMIN_CONSTANTS.titleMaxLength),
  description: OPTIONAL_DESCRIPTION,
  ordinal: z.number().int().min(ADMIN_CONSTANTS.minOrdinal),
  isActive: z.boolean().optional(),
});

export const updateLessonSchema = z.object({
  code: z.string().trim().min(1).max(ADMIN_CONSTANTS.codeMaxLength).optional(),
  title: z.string().trim().min(1).max(ADMIN_CONSTANTS.titleMaxLength).optional(),
  description: OPTIONAL_DESCRIPTION,
  ordinal: z.number().int().min(ADMIN_CONSTANTS.minOrdinal).optional(),
  isActive: z.boolean().optional(),
});

export const createWordSchema = z.object({
  lessonId: UUID_SCHEMA,
  enText: z.string().trim().min(1).max(ADMIN_CONSTANTS.textMaxLength),
  uaText: z.string().trim().min(1).max(ADMIN_CONSTANTS.textMaxLength),
  itText: z.string().trim().max(ADMIN_CONSTANTS.textMaxLength).optional(),
  ordinal: z.number().int().min(ADMIN_CONSTANTS.minOrdinal),
});

export const updateWordSchema = z.object({
  enText: z.string().trim().min(1).max(ADMIN_CONSTANTS.textMaxLength).optional(),
  uaText: z.string().trim().min(1).max(ADMIN_CONSTANTS.textMaxLength).optional(),
  itText: z.string().trim().max(ADMIN_CONSTANTS.textMaxLength).optional(),
  ordinal: z.number().int().min(ADMIN_CONSTANTS.minOrdinal).optional(),
});

export const createPhraseSchema = z.object({
  lessonId: UUID_SCHEMA,
  enText: z.string().trim().min(1).max(ADMIN_CONSTANTS.textMaxLength),
  uaText: z.string().trim().min(1).max(ADMIN_CONSTANTS.textMaxLength),
  itText: z.string().trim().max(ADMIN_CONSTANTS.textMaxLength).optional(),
  ordinal: z.number().int().min(ADMIN_CONSTANTS.minOrdinal),
});

export const updatePhraseSchema = z.object({
  enText: z.string().trim().min(1).max(ADMIN_CONSTANTS.textMaxLength).optional(),
  uaText: z.string().trim().min(1).max(ADMIN_CONSTANTS.textMaxLength).optional(),
  itText: z.string().trim().max(ADMIN_CONSTANTS.textMaxLength).optional(),
  ordinal: z.number().int().min(ADMIN_CONSTANTS.minOrdinal).optional(),
});

export const courseIdParamSchema = z.object({ courseId: UUID_SCHEMA });
export const lessonIdParamSchema = z.object({ lessonId: UUID_SCHEMA });
export const wordIdParamSchema = z.object({ wordId: UUID_SCHEMA });
export const phraseIdParamSchema = z.object({ phraseId: UUID_SCHEMA });

export const testersActivityQuerySchema = z.object({
  hours: z.coerce.number().int().min(1).max(24 * 30).default(24 * 7),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});
