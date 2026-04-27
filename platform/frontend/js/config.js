const CURRENT_LEARNING_LANGUAGE = window.LingvoLearningLanguage?.getCurrentLanguage?.() || "en";

const VOICE_LANGUAGE_BY_LEARNING_LANGUAGE = Object.freeze({
  en: ["en-US", "en-GB"],
  it: ["it-IT"],
});

export const APP_CONFIG = Object.freeze({
  APP_NAME: "Lingvo",
  STORAGE_KEY: `lingvo_progress_${CURRENT_LEARNING_LANGUAGE}_v1`,
  DEFAULT_LEVEL: "A0",
  PASS_THRESHOLD_PERCENT: 70,
  MAX_INPUT_LENGTH: 250,
  TELEMETRY_ENABLED: true,
  AUTH_ENABLED: false,
  CURRENT_LEARNING_LANGUAGE,
  LEARNING_LANGUAGE_LABEL_UA: CURRENT_LEARNING_LANGUAGE === "it" ? "італійська" : "англійська",
  SUPPORTED_VOICE_LANGS: VOICE_LANGUAGE_BY_LEARNING_LANGUAGE[CURRENT_LEARNING_LANGUAGE] || VOICE_LANGUAGE_BY_LEARNING_LANGUAGE.en,
});

export const UI_TEXT = Object.freeze({
  EMPTY_INPUT: "Введи відповідь перед відправкою.",
  INPUT_TOO_LONG: "Текст занадто довгий. Скороти відповідь.",
  RESET_CONFIRM: "Справді скинути прогрес?",
  UNKNOWN_ERROR: "Сталася помилка. Спробуй ще раз.",
});
