import { AppLogger } from "./logger.js";
import { InputValidator } from "./validation.js";
import { ProgressRepository } from "./storage.js";
import { SpeechService } from "./speech.js";
import { AuthExtensionService } from "./auth-placeholder.js";
import { APP_CONFIG } from "./config.js";
import { TutorController } from "./app.js";

const logger = new AppLogger();
const inputValidator = new InputValidator();
const progressRepository = new ProgressRepository(logger);
const speechService = new SpeechService(logger);
const authExtensionService = new AuthExtensionService(logger);

const pageTitle = APP_CONFIG.CURRENT_LEARNING_LANGUAGE === "it"
  ? "Lingvo - Italian from Zero"
  : "Lingvo - English from Zero";
const pageHeading = APP_CONFIG.CURRENT_LEARNING_LANGUAGE === "it"
  ? "Lingvo: Italian from Zero"
  : "Lingvo: English from Zero";
const pageSubtitle = APP_CONFIG.CURRENT_LEARNING_LANGUAGE === "it"
  ? "Тренажер спілкування італійською з нуля"
  : "Тренажер спілкування англійською з нуля";

document.title = pageTitle;
const headingElement = document.querySelector(".app-header h1");
if (headingElement) {
  headingElement.textContent = pageHeading;
}
const subtitleElement = document.querySelector(".app-header p");
if (subtitleElement) {
  subtitleElement.textContent = pageSubtitle;
}

const appController = new TutorController({
  logger,
  inputValidator,
  progressRepository,
  speechService,
  authExtensionService,
  elements: {
    levelLabel: document.getElementById("levelLabel"),
    correctCount: document.getElementById("correctCount"),
    attemptCount: document.getElementById("attemptCount"),
    taskPrompt: document.getElementById("taskPrompt"),
    chatContainer: document.getElementById("chatContainer"),
    userInput: document.getElementById("userInput"),
    sendButton: document.getElementById("sendButton"),
    dictionaryButton: document.getElementById("dictionaryButton"),
    dictionaryMoreButton: document.getElementById("dictionaryMoreButton"),
    translationToggleButton: document.getElementById("translationToggleButton"),
    lessonButton: document.getElementById("lessonButton"),
    speakButton: document.getElementById("speakButton"),
    resetButton: document.getElementById("resetButton"),
    lessonSelect: document.getElementById("lessonSelect"),
    startLessonButton: document.getElementById("startLessonButton"),
  },
});

appController.initialize();
