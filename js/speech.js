import { APP_CONFIG } from "./config.js";

export class SpeechService {
  constructor(logger) {
    this.logger = logger;
  }

  speakLessonText(text) {
    try {
      this.logger.info("speech.speak.start", { textLength: text.length });
      if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
        this.logger.info("speech.speak.unsupported");
        return false;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = APP_CONFIG.SUPPORTED_VOICE_LANGS[0];
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      this.logger.info("speech.speak.success");
      return true;
    } catch (error) {
      this.logger.error("speech.speak.failed", error, { text });
      return false;
    }
  }

  speakEnglish(text) {
    return this.speakLessonText(text);
  }
}
