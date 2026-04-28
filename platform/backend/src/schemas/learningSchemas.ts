import { z } from "zod";
import { LEARNING_CONSTANTS } from "../config/learningConstants";
import { LANGUAGE_CONSTANTS } from "../config/languageConstants";

const UUID_SCHEMA = z.string().uuid();
const languageCodeSchema = z.string().trim().toLowerCase().regex(/^[a-z]{2}$/);

export const courseIdParamsSchema = z.object({
  courseId: UUID_SCHEMA,
});

export const lessonIdParamsSchema = z.object({
  lessonId: UUID_SCHEMA,
});

<<<<<<< HEAD
export const learningContentQuerySchema = z.object({
  learningLanguage: languageCodeSchema
    .refine((value) => LANGUAGE_CONSTANTS.supportedLearningLanguages.includes(value), "Unsupported learning language")
    .optional(),
  translationLanguage: languageCodeSchema
    .refine(
      (value) => LANGUAGE_CONSTANTS.supportedTranslationLanguages.includes(value),
      "Unsupported translation language",
    )
    .optional(),
=======
export const lessonContentQuerySchema = z.object({
  targetLang: z.enum(["en", "it"]).optional().default("en"),
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
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
