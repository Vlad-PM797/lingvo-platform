import { z } from "zod";
import { LEARNING_CONSTANTS } from "../config/learningConstants";

const UUID_SCHEMA = z.string().uuid();

export const courseIdParamsSchema = z.object({
  courseId: UUID_SCHEMA,
});

export const lessonIdParamsSchema = z.object({
  lessonId: UUID_SCHEMA,
});

export const lessonContentQuerySchema = z.object({
  targetLang: z.enum(["en", "it"]).optional().default("en"),
});

export const submitAttemptSchema = z.object({
  lessonId: UUID_SCHEMA,
  promptType: z.string().trim().min(LEARNING_CONSTANTS.minAnswerLength).max(LEARNING_CONSTANTS.promptTypeMaxLength),
  sourceText: z.string().trim().min(LEARNING_CONSTANTS.minAnswerLength).max(LEARNING_CONSTANTS.textFieldMaxLength),
  expectedAnswers: z
    .array(z.string().trim().min(LEARNING_CONSTANTS.minAnswerLength).max(LEARNING_CONSTANTS.textFieldMaxLength))
    .min(1),
  userAnswer: z.string().trim().min(LEARNING_CONSTANTS.minAnswerLength).max(LEARNING_CONSTANTS.textFieldMaxLength),
});
