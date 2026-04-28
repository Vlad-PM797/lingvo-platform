import { APP_CONFIG, UI_TEXT } from "./config.js";

export class InputValidator {
  validateRawInput(rawValue) {
    const normalized = String(rawValue ?? "").trim();

    if (!normalized) {
      return { valid: false, reason: UI_TEXT.EMPTY_INPUT, normalized: "" };
    }

    if (normalized.length > APP_CONFIG.MAX_INPUT_LENGTH) {
      return { valid: false, reason: UI_TEXT.INPUT_TOO_LONG, normalized: "" };
    }

    return { valid: true, reason: "", normalized: this.normalizeAnswer(normalized) };
  }

  normalizeAnswer(value) {
    return value
      .toLowerCase()
      .replace(/[.,!?;:]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  isAnswerCorrect(userAnswer, expectedAnswers) {
    const normalizedUserAnswer = this.normalizeAnswer(userAnswer);
    return expectedAnswers.some((expectedAnswer) => {
      const normalizedExpectedAnswer = this.normalizeAnswer(expectedAnswer);
      if (!normalizedExpectedAnswer.includes("*")) {
        return normalizedExpectedAnswer === normalizedUserAnswer;
      }

      return this.matchWildcardPattern(normalizedUserAnswer, normalizedExpectedAnswer);
    });
  }

  matchWildcardPattern(normalizedUserAnswer, normalizedExpectedAnswer) {
    const pattern = normalizedExpectedAnswer
      .split("*")
      .map((part) => this.escapeRegex(part.trim()))
      .join("\\s+[\\p{L}'\\-]+(?:\\s+[\\p{L}'\\-]+)*\\s*");
    const wildcardRegex = new RegExp(`^${pattern}$`, "iu");
    return wildcardRegex.test(normalizedUserAnswer);
  }

  escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
