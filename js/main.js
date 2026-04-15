import { AppLogger } from "./logger.js";
import { InputValidator } from "./validation.js";
import { ProgressRepository } from "./storage.js";
import { SpeechService } from "./speech.js";
import { AuthExtensionService } from "./auth-placeholder.js";
import { EnglishTutorController } from "./app.js";

const logger = new AppLogger();
const inputValidator = new InputValidator();
const progressRepository = new ProgressRepository(logger);
const speechService = new SpeechService(logger);
const authExtensionService = new AuthExtensionService(logger);

const appController = new EnglishTutorController({
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
  },
});

appController.initialize();
