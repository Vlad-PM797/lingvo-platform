import { APP_CONFIG } from "./config.js";

export class ProgressRepository {
  constructor(logger) {
    this.logger = logger;
  }

  loadProgress() {
    try {
      this.logger.info("storage.loadProgress.start", { key: APP_CONFIG.STORAGE_KEY });
      const rawPayload = window.localStorage.getItem(APP_CONFIG.STORAGE_KEY);
      if (!rawPayload) {
        return this.createDefaultProgress();
      }

      const parsedPayload = JSON.parse(rawPayload);
      this.logger.info("storage.loadProgress.success");
      return {
        level: parsedPayload.level || APP_CONFIG.DEFAULT_LEVEL,
        correctCount: Number(parsedPayload.correctCount || 0),
        attemptCount: Number(parsedPayload.attemptCount || 0),
        stepIndex: Number(parsedPayload.stepIndex || 0),
        shownMaterials: parsedPayload.shownMaterials && typeof parsedPayload.shownMaterials === "object"
          ? parsedPayload.shownMaterials
          : {},
        translationHintsEnabled: parsedPayload.translationHintsEnabled !== false,
        introProgress: parsedPayload.introProgress && typeof parsedPayload.introProgress === "object"
          ? parsedPayload.introProgress
          : {},
      };
    } catch (error) {
      this.logger.error("storage.loadProgress.failed", error);
      return this.createDefaultProgress();
    }
  }

  saveProgress(progressState) {
    try {
      this.logger.info("storage.saveProgress.start");
      const rawPayload = JSON.stringify(progressState);
      window.localStorage.setItem(APP_CONFIG.STORAGE_KEY, rawPayload);
      this.logger.info("storage.saveProgress.success");
    } catch (error) {
      this.logger.error("storage.saveProgress.failed", error, { progressState });
    }
  }

  clearProgress() {
    try {
      this.logger.info("storage.clearProgress.start");
      window.localStorage.removeItem(APP_CONFIG.STORAGE_KEY);
      this.logger.info("storage.clearProgress.success");
    } catch (error) {
      this.logger.error("storage.clearProgress.failed", error);
    }
  }

  createDefaultProgress() {
    return {
      level: APP_CONFIG.DEFAULT_LEVEL,
      correctCount: 0,
      attemptCount: 0,
      stepIndex: 0,
      shownMaterials: {},
      translationHintsEnabled: true,
      introProgress: {},
    };
  }
}
