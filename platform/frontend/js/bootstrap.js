import { APP_CONFIG } from "./config.js";
import { AppLogger } from "./logger.js";
import { InputValidator } from "./validation.js";
import { ProgressRepository } from "./storage.js";
import { SpeechService } from "./speech.js";
import { AuthExtensionService } from "./auth-placeholder.js";

export function resolveTrainerPageCopy() {
  if (APP_CONFIG.CURRENT_LEARNING_LANGUAGE === "it") {
    return {
      title: "Lingvo - Italian from Zero",
      heading: "Lingvo: Italian from Zero",
      subtitle: "Тренажер спілкування італійською з нуля",
    };
  }

  return {
    title: "Lingvo - English from Zero",
    heading: "Lingvo: English from Zero",
    subtitle: "Тренажер спілкування англійською з нуля",
  };
}

export function applyTrainerPageCopy() {
  const pageCopy = resolveTrainerPageCopy();
  document.title = pageCopy.title;

  const headingElement = document.querySelector(".app-header h1");
  if (headingElement) {
    headingElement.textContent = pageCopy.heading;
  }

  const subtitleElement = document.querySelector(".app-header p");
  if (subtitleElement) {
    subtitleElement.textContent = pageCopy.subtitle;
  }
}

export function collectTrainerElements() {
  return {
    levelLabel: document.getElementById("levelLabel"),
    correctCount: document.getElementById("correctCount"),
    attemptCount: document.getElementById("attemptCount"),
    taskPrompt: document.getElementById("taskPrompt"),
    chatContainer: document.getElementById("chatContainer"),
    userInput: document.getElementById("userInput"),
    sendButton: document.getElementById("sendButton"),
    translationPracticePrompt: document.getElementById("translationPracticePrompt"),
    translationPracticeInput: document.getElementById("translationPracticeInput"),
    translationPracticeCheckButton: document.getElementById("translationPracticeCheckButton"),
    translationPracticeResult: document.getElementById("translationPracticeResult"),
    dictionaryButton: document.getElementById("dictionaryButton"),
    dictionaryMoreButton: document.getElementById("dictionaryMoreButton"),
    translationToggleButton: document.getElementById("translationToggleButton"),
    lessonButton: document.getElementById("lessonButton"),
    speakButton: document.getElementById("speakButton"),
    resetButton: document.getElementById("resetButton"),
    lessonSelect: document.getElementById("lessonSelect"),
    startLessonButton: document.getElementById("startLessonButton"),
  };
}

export function createTrainerServices() {
  const logger = new AppLogger();
  return {
    logger,
    inputValidator: new InputValidator(),
    progressRepository: new ProgressRepository(logger),
    speechService: new SpeechService(logger),
    authExtensionService: new AuthExtensionService(logger),
  };
}
