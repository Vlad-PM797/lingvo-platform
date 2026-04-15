export const APP_CONFIG = Object.freeze({
  APP_NAME: "Lingvo",
  STORAGE_KEY: "lingvo_progress_v1",
  DEFAULT_LEVEL: "A0",
  PASS_THRESHOLD_PERCENT: 70,
  MAX_INPUT_LENGTH: 250,
  TELEMETRY_ENABLED: true,
  AUTH_ENABLED: false,
  SUPPORTED_VOICE_LANGS: ["en-US", "en-GB"],
});

export const UI_TEXT = Object.freeze({
  EMPTY_INPUT: "Введи відповідь перед відправкою.",
  INPUT_TOO_LONG: "Текст занадто довгий. Скороти відповідь.",
  RESET_CONFIRM: "Справді скинути прогрес?",
  UNKNOWN_ERROR: "Сталася помилка. Спробуй ще раз.",
});
