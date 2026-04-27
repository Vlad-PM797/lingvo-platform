export const LANGUAGE_CONSTANTS = Object.freeze({
  defaultLearningLanguage: "en",
  defaultTranslationLanguage: "ua",
  supportedLearningLanguages: ["en", "it"],
  supportedTranslationLanguages: ["ua"],
});

export type SupportedLearningLanguage = (typeof LANGUAGE_CONSTANTS.supportedLearningLanguages)[number];
export type SupportedTranslationLanguage = (typeof LANGUAGE_CONSTANTS.supportedTranslationLanguages)[number];
