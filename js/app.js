import { APP_CONFIG, UI_TEXT } from "./config.js";
import { EN_UA_GLOSSARY, LESSON_MATERIALS, LESSON_STEPS, PROJECT_INTROS } from "./content.js";

const SHORT_WORD_TEST_COUNT = 10;
const SHORT_PHRASE_TEST_COUNT = 8;
const INTRO_CONTENT_VERSION = 4;
const DICTIONARY_WORD_PAGE_SIZE = 20;
const DICTIONARY_PHRASE_PAGE_SIZE = 10;

export class EnglishTutorController {
  constructor(options) {
    this.logger = options.logger;
    this.inputValidator = options.inputValidator;
    this.progressRepository = options.progressRepository;
    this.speechService = options.speechService;
    this.authExtensionService = options.authExtensionService;
    this.elements = options.elements;
    this.progressState = this.progressRepository.loadProgress();
    this.lastEnglishSentence = "";
    this.translationHintsEnabled = this.progressState.translationHintsEnabled !== false;
    this.pendingIntroQuestion = null;
    this.dictionaryViewState = {};
  }

  initialize() {
    try {
      this.logger.info("app.initialize.start");
      const authState = this.authExtensionService.ensureSession();
      this.logger.info("auth.state", authState);
      this.bindEvents();
      this.applyHintsVisibilityClass();
      this.updateTranslationToggleButtonLabel();
      this.setTaskPrompt("Прочитай повідомлення бота і виконай поточне завдання.");
      this.renderStatus();
      this.showCurrentStepMessage();
      this.logger.info("app.initialize.success");
    } catch (error) {
      this.logger.error("app.initialize.failed", error);
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  bindEvents() {
    this.elements.sendButton.addEventListener("click", () => this.handleSubmit());
    this.elements.userInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.handleSubmit();
      }
    });
    this.elements.dictionaryButton.addEventListener("click", () => this.handleShowDictionary());
    this.elements.dictionaryMoreButton.addEventListener("click", () => this.handleShowMoreDictionary());
    this.elements.translationToggleButton.addEventListener("click", () => this.handleTranslationHintsToggle());
    this.elements.lessonButton.addEventListener("click", () => this.handleLessonReplay());
    this.elements.speakButton.addEventListener("click", () => this.handleSpeak());
    this.elements.resetButton.addEventListener("click", () => this.handleReset());
  }

  handleTranslationHintsToggle() {
    try {
      this.translationHintsEnabled = !this.translationHintsEnabled;
      this.progressState.translationHintsEnabled = this.translationHintsEnabled;
      this.progressRepository.saveProgress(this.progressState);
      this.applyHintsVisibilityClass();
      this.updateTranslationToggleButtonLabel();
      this.logger.info("app.translationHints.toggle", { enabled: this.translationHintsEnabled });
    } catch (error) {
      this.logger.error("app.translationHints.toggle.failed", error);
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  handleSubmit() {
    try {
      this.logger.info("app.submit.start");
      const currentStep = this.getCurrentStep();
      if (!currentStep) {
        this.pushBotMessage("Урок завершено. Натисни Скинути прогрес для нового старту.");
        this.setTaskPrompt("Урок завершено. Натисни Скинути прогрес.");
        return;
      }

      const introDone = this.runIntroFlowIfNeeded(currentStep.project);
      if (!introDone && !this.pendingIntroQuestion) {
        this.elements.userInput.value = "";
        this.showCurrentStepMessage();
        return;
      }

      const validationResult = this.inputValidator.validateRawInput(this.elements.userInput.value);
      if (!validationResult.valid) {
        this.pushBotMessage(validationResult.reason);
        return;
      }

      const userText = validationResult.normalized;
      if (this.pendingIntroQuestion) {
        this.pushUserMessage(this.elements.userInput.value.trim());
        this.elements.userInput.value = "";
        this.handleIntroAnswer(userText);
        return;
      }

      this.pushUserMessage(this.elements.userInput.value.trim());
      this.elements.userInput.value = "";

      this.progressState.attemptCount += 1;
      const isCorrect = this.inputValidator.isAnswerCorrect(userText, currentStep.expectedAnswers);
      if (isCorrect) {
        this.progressState.correctCount += 1;
        this.pushBotMessage(`Правильно. ${currentStep.explanationUa}`);
        this.progressState.stepIndex += 1;
      } else {
        const expected = currentStep.expectedAnswers[0];
        this.pushBotMessage(`Майже. Приклад правильної відповіді: ${expected}`);
      }

      this.refreshLevel();
      this.progressRepository.saveProgress(this.progressState);
      this.renderStatus();
      this.showCurrentStepMessage();
      this.logger.info("app.submit.success", { isCorrect });
    } catch (error) {
      this.logger.error("app.submit.failed", error);
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  handleSpeak() {
    try {
      this.logger.info("app.speak.attempt");
      if (!this.lastEnglishSentence) {
        this.pushBotMessage("Поки немає англійської фрази для озвучки.");
        return;
      }

      const success = this.speechService.speakEnglish(this.lastEnglishSentence);
      if (!success) {
        this.pushBotMessage("Озвучка не підтримується у цьому браузері.");
      }
    } catch (error) {
      this.logger.error("app.speak.failed", error);
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  handleLessonReplay() {
    try {
      const currentStep = this.getCurrentStep();
      if (!currentStep) {
        this.pushBotMessage("Зараз немає активного уроку для пояснення.");
        return;
      }

      this.showLessonMaterialIfNeeded(currentStep.project, true);
    } catch (error) {
      this.logger.error("app.handleLessonReplay.failed", error);
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  handleShowDictionary() {
    try {
      const currentStep = this.getCurrentStep();
      if (!currentStep) {
        this.pushBotMessage("Урок завершено. Словник теми зараз недоступний.");
        return;
      }

      const projectIntro = PROJECT_INTROS[currentStep.project];
      if (!projectIntro) {
        this.pushBotMessage(`Для теми ${currentStep.project} словник не знайдено.`);
        return;
      }

      this.dictionaryViewState[currentStep.project] = {
        wordOffset: 0,
        phraseOffset: 0,
      };
      this.showDictionaryPage(currentStep.project);
      this.setTaskPrompt(`Показано частину словника теми ${currentStep.project}. Для продовження натисни Показати ще.`);
    } catch (error) {
      this.logger.error("app.handleShowDictionary.failed", error);
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  handleShowMoreDictionary() {
    try {
      const currentStep = this.getCurrentStep();
      if (!currentStep) {
        this.pushBotMessage("Урок завершено. Немає активної теми для словника.");
        return;
      }

      const projectIntro = PROJECT_INTROS[currentStep.project];
      if (!projectIntro) {
        this.pushBotMessage(`Для теми ${currentStep.project} словник не знайдено.`);
        return;
      }

      if (!this.dictionaryViewState[currentStep.project]) {
        this.dictionaryViewState[currentStep.project] = {
          wordOffset: 0,
          phraseOffset: 0,
        };
      }

      const viewState = this.dictionaryViewState[currentStep.project];
      const hasMoreWords = viewState.wordOffset < projectIntro.words.length;
      const hasMorePhrases = viewState.phraseOffset < projectIntro.phrases.length;
      if (!hasMoreWords && !hasMorePhrases) {
        this.pushBotMessage(`Словник теми ${currentStep.project} вже показано повністю.`);
        return;
      }

      this.showDictionaryPage(currentStep.project);
    } catch (error) {
      this.logger.error("app.handleShowMoreDictionary.failed", error);
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  handleReset() {
    try {
      const shouldReset = window.confirm(UI_TEXT.RESET_CONFIRM);
      if (!shouldReset) {
        return;
      }

      this.progressState = this.progressRepository.createDefaultProgress();
      this.translationHintsEnabled = this.progressState.translationHintsEnabled !== false;
      this.pendingIntroQuestion = null;
      this.progressRepository.clearProgress();
      this.elements.chatContainer.innerHTML = "";
      this.applyHintsVisibilityClass();
      this.updateTranslationToggleButtonLabel();
      this.renderStatus();
      this.showCurrentStepMessage();
      this.logger.info("app.reset.success");
    } catch (error) {
      this.logger.error("app.reset.failed", error);
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  renderStatus() {
    this.elements.levelLabel.textContent = this.progressState.level;
    this.elements.correctCount.textContent = String(this.progressState.correctCount);
    this.elements.attemptCount.textContent = String(this.progressState.attemptCount);
  }

  showCurrentStepMessage() {
    try {
      const currentStep = this.getCurrentStep();
      if (!currentStep) {
        this.pushBotMessage("Супер. Урок завершено. Натисни Скинути прогрес, щоб почати знову.");
        return;
      }

      const introDone = this.runIntroFlowIfNeeded(currentStep.project);
      if (!introDone) {
        return;
      }

      this.showLessonMaterialIfNeeded(currentStep.project);
      const englishHint = this.getPrimaryExpectedAnswer(currentStep);
      this.lastEnglishSentence = englishHint;
      this.pushBotMessage(`[${currentStep.project}] ${currentStep.promptUa}`);
      this.setTaskPrompt(`Завдання: ${currentStep.promptUa}`);
    } catch (error) {
      this.logger.error("app.showCurrentStepMessage.failed", error);
    }
  }

  getCurrentStep() {
    return LESSON_STEPS[this.progressState.stepIndex] || null;
  }

  showLessonMaterialIfNeeded(projectName, forceShow = false) {
    try {
      if (!this.progressState.shownMaterials) {
        this.progressState.shownMaterials = {};
      }

      if (this.progressState.shownMaterials[projectName] && !forceShow) {
        return;
      }

      const lessonMaterial = LESSON_MATERIALS[projectName];
      if (!lessonMaterial) {
        return;
      }

      this.pushBotMessage(lessonMaterial);
      this.progressState.shownMaterials[projectName] = true;
      this.progressRepository.saveProgress(this.progressState);
      this.logger.info("app.lessonMaterial.shown", { projectName });
    } catch (error) {
      this.logger.error("app.lessonMaterial.failed", error, { projectName });
    }
  }

  runIntroFlowIfNeeded(projectName) {
    try {
      const projectIntro = PROJECT_INTROS[projectName];
      if (!projectIntro) {
        return true;
      }

      if (!this.progressState.introProgress) {
        this.progressState.introProgress = {};
      }

      if (!this.progressState.introProgress[projectName]) {
        const wordsSampleIndices = this.buildSampleIndices(projectIntro.words.length, SHORT_WORD_TEST_COUNT);
        const phrasesSampleIndices = this.buildSampleIndices(projectIntro.phrases.length, SHORT_PHRASE_TEST_COUNT);
        this.progressState.introProgress[projectName] = {
          contentVersion: INTRO_CONTENT_VERSION,
          wordsShown: false,
          wordsTestIndex: 0,
          wordsDirection: "ua_to_en",
          wordsSampleIndices,
          phrasesShown: false,
          phrasesTestIndex: 0,
          phrasesDirection: "ua_to_en",
          phrasesSampleIndices,
          completed: false,
        };
      }

      const introState = this.progressState.introProgress[projectName];
      if (introState.contentVersion !== INTRO_CONTENT_VERSION) {
        introState.contentVersion = INTRO_CONTENT_VERSION;
        introState.wordsShown = false;
        introState.wordsTestIndex = 0;
        introState.wordsDirection = "ua_to_en";
        introState.wordsSampleIndices = this.buildSampleIndices(projectIntro.words.length, SHORT_WORD_TEST_COUNT);
        introState.phrasesShown = false;
        introState.phrasesTestIndex = 0;
        introState.phrasesDirection = "ua_to_en";
        introState.phrasesSampleIndices = this.buildSampleIndices(projectIntro.phrases.length, SHORT_PHRASE_TEST_COUNT);
        introState.completed = false;
      }
      if (!Array.isArray(introState.wordsSampleIndices) || introState.wordsSampleIndices.length === 0) {
        introState.wordsSampleIndices = this.buildSampleIndices(projectIntro.words.length, SHORT_WORD_TEST_COUNT);
      }
      if (!Array.isArray(introState.phrasesSampleIndices) || introState.phrasesSampleIndices.length === 0) {
        introState.phrasesSampleIndices = this.buildSampleIndices(projectIntro.phrases.length, SHORT_PHRASE_TEST_COUNT);
      }
      if (introState.completed) {
        this.pendingIntroQuestion = null;
        return true;
      }

      if (!introState.wordsShown) {
        this.pushBotMessage(this.buildWordListMessage(projectName, projectIntro.words));
        this.setTaskPrompt("Ознайомся зі словником слів. Коли будеш готовий, натисни Надіслати.");
        introState.wordsShown = true;
        this.progressRepository.saveProgress(this.progressState);
        return false;
      }

      if (introState.wordsTestIndex < introState.wordsSampleIndices.length) {
        this.askIntroQuestion(projectName, "words");
        return false;
      }

      if (!introState.phrasesShown) {
        this.pushBotMessage(this.buildPhraseListMessage(projectName, projectIntro.phrases));
        this.setTaskPrompt("Ознайомся зі словником фраз. Коли будеш готовий, натисни Надіслати.");
        introState.phrasesShown = true;
        this.progressRepository.saveProgress(this.progressState);
        return false;
      }

      if (introState.phrasesTestIndex < introState.phrasesSampleIndices.length) {
        this.askIntroQuestion(projectName, "phrases");
        return false;
      }

      introState.completed = true;
      this.progressRepository.saveProgress(this.progressState);
      this.pushBotMessage(`Тест словника та фраз для теми ${projectName} завершено. Переходимо до вправ уроку.`);
      return true;
    } catch (error) {
      this.logger.error("app.runIntroFlowIfNeeded.failed", error, { projectName });
      return true;
    }
  }

  buildWordListMessage(projectName, words) {
    const lines = [`Словник теми ${projectName} (англійська - українська):`];
    for (const wordItem of words) {
      lines.push(`- ${wordItem.en} - ${wordItem.ua}`);
    }
    return lines.join("\n");
  }

  buildPhraseListMessage(projectName, phrases) {
    const lines = [`Фрази теми ${projectName} (англійська - українська):`];
    for (const phraseItem of phrases) {
      lines.push(`- ${phraseItem.en} - ${phraseItem.ua}`);
    }
    return lines.join("\n");
  }

  showDictionaryPage(projectName) {
    const projectIntro = PROJECT_INTROS[projectName];
    const viewState = this.dictionaryViewState[projectName];

    const wordsStart = viewState.wordOffset;
    const wordsEnd = Math.min(wordsStart + DICTIONARY_WORD_PAGE_SIZE, projectIntro.words.length);
    const wordsSlice = projectIntro.words.slice(wordsStart, wordsEnd);
    if (wordsSlice.length > 0) {
      const lines = [
        `Словник теми ${projectName}: слова ${wordsStart + 1}-${wordsEnd} з ${projectIntro.words.length}`,
      ];
      for (const wordItem of wordsSlice) {
        lines.push(`- ${wordItem.en} - ${wordItem.ua}`);
      }
      this.pushBotMessage(lines.join("\n"));
      viewState.wordOffset = wordsEnd;
    }

    const phrasesStart = viewState.phraseOffset;
    const phrasesEnd = Math.min(phrasesStart + DICTIONARY_PHRASE_PAGE_SIZE, projectIntro.phrases.length);
    const phrasesSlice = projectIntro.phrases.slice(phrasesStart, phrasesEnd);
    if (phrasesSlice.length > 0) {
      const lines = [
        `Словник теми ${projectName}: фрази ${phrasesStart + 1}-${phrasesEnd} з ${projectIntro.phrases.length}`,
      ];
      for (const phraseItem of phrasesSlice) {
        lines.push(`- ${phraseItem.en} - ${phraseItem.ua}`);
      }
      this.pushBotMessage(lines.join("\n"));
      viewState.phraseOffset = phrasesEnd;
    }
  }

  askIntroQuestion(projectName, groupType) {
    try {
      const projectIntro = PROJECT_INTROS[projectName];
      const introState = this.progressState.introProgress[projectName];
      const isWordGroup = groupType === "words";
      const list = isWordGroup ? projectIntro.words : projectIntro.phrases;
      const testIndex = isWordGroup ? introState.wordsTestIndex : introState.phrasesTestIndex;
      const sampleIndices = isWordGroup ? introState.wordsSampleIndices : introState.phrasesSampleIndices;
      const actualItemIndex = sampleIndices[testIndex];
      const direction = isWordGroup ? introState.wordsDirection : introState.phrasesDirection;
      const currentItem = list[actualItemIndex];

      let promptText = "";
      let expectedAnswers = [];
      if (direction === "ua_to_en") {
        promptText = isWordGroup
          ? `Тест словника: переклади українською -> англійською: ${currentItem.ua}`
          : `Тест фраз: переклади українською -> англійською: ${currentItem.ua}`;
        expectedAnswers = this.collectExpectedAnswers(list, "ua", currentItem.ua, "en");
      } else {
        promptText = isWordGroup
          ? `Тест словника: переклади англійською -> українською: ${currentItem.en}`
          : `Тест фраз: переклади англійською -> українською: ${currentItem.en}`;
        expectedAnswers = this.collectExpectedAnswers(list, "en", currentItem.en, "ua");
      }

      this.pendingIntroQuestion = {
        projectName,
        groupType,
        expectedAnswers,
        promptText,
      };
      this.pushBotMessage(promptText);
      this.setTaskPrompt(promptText);
    } catch (error) {
      this.logger.error("app.askIntroQuestion.failed", error, { projectName, groupType });
    }
  }

  buildSampleIndices(totalCount, sampleCount) {
    const targetCount = Math.min(totalCount, sampleCount);
    const indices = Array.from({ length: totalCount }, (_, index) => index);
    for (let index = indices.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const tempValue = indices[index];
      indices[index] = indices[randomIndex];
      indices[randomIndex] = tempValue;
    }
    return indices.slice(0, targetCount);
  }

  collectExpectedAnswers(list, matchFieldName, matchFieldValue, resultFieldName) {
    const normalizedMatchFieldValue = this.inputValidator.normalizeAnswer(matchFieldValue);
    const answers = [];
    const answerSet = new Set();
    for (const item of list) {
      const normalizedItemMatchValue = this.inputValidator.normalizeAnswer(item[matchFieldName]);
      if (normalizedItemMatchValue !== normalizedMatchFieldValue) {
        continue;
      }
      const normalizedAnswerValue = this.inputValidator.normalizeAnswer(item[resultFieldName]);
      if (answerSet.has(normalizedAnswerValue)) {
        continue;
      }
      answerSet.add(normalizedAnswerValue);
      answers.push(normalizedAnswerValue);
    }

    if (answers.length === 0) {
      answers.push(this.inputValidator.normalizeAnswer(matchFieldValue));
    }
    return answers;
  }

  handleIntroAnswer(userText) {
    try {
      const introQuestion = this.pendingIntroQuestion;
      if (!introQuestion) {
        return;
      }

      const normalizedUserText = this.inputValidator.normalizeAnswer(userText);
      const isCorrect = introQuestion.expectedAnswers.includes(normalizedUserText);
      if (!isCorrect) {
        this.pushBotMessage(`Поки ні. Правильна відповідь: ${introQuestion.expectedAnswers.join(" / ")}`);
      } else {
        this.pushBotMessage("Правильно, чудово.");
      }

      const introState = this.progressState.introProgress[introQuestion.projectName];
      if (introQuestion.groupType === "words") {
        introState.wordsTestIndex += 1;
        introState.wordsDirection = introState.wordsDirection === "ua_to_en" ? "en_to_ua" : "ua_to_en";
      } else {
        introState.phrasesTestIndex += 1;
        introState.phrasesDirection = introState.phrasesDirection === "ua_to_en" ? "en_to_ua" : "ua_to_en";
      }

      this.pendingIntroQuestion = null;
      this.progressRepository.saveProgress(this.progressState);
      this.showCurrentStepMessage();
    } catch (error) {
      this.logger.error("app.handleIntroAnswer.failed", error);
      this.pendingIntroQuestion = null;
      this.pushBotMessage(UI_TEXT.UNKNOWN_ERROR);
    }
  }

  getPrimaryExpectedAnswer(step) {
    return step.expectedAnswers[0];
  }

  refreshLevel() {
    const attempted = this.progressState.attemptCount;
    if (attempted <= 0) {
      this.progressState.level = APP_CONFIG.DEFAULT_LEVEL;
      return;
    }

    const scorePercent = Math.round((this.progressState.correctCount / attempted) * 100);
    this.progressState.level = scorePercent >= APP_CONFIG.PASS_THRESHOLD_PERCENT ? "A1" : "A0";
  }

  pushBotMessage(text) {
    this.pushMessage(text, "bot");
  }

  pushUserMessage(text) {
    this.pushMessage(text, "user");
  }

  pushMessage(text, role) {
    const messageElement = document.createElement("article");
    messageElement.className = `message ${role}`;
    if (role === "bot") {
      this.renderTextWithGlossary(messageElement, text);
    } else {
      messageElement.textContent = text;
    }
    this.elements.chatContainer.appendChild(messageElement);
    this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
  }

  renderTextWithGlossary(containerElement, sourceText) {
    if (!this.translationHintsEnabled) {
      containerElement.textContent = sourceText;
      return;
    }

    const escapedText = this.escapeHtml(sourceText);
    const lines = escapedText.split("\n");
    const sortedEntries = Object.entries(EN_UA_GLOSSARY)
      .map(([phrase, translation]) => [phrase.toLowerCase(), translation])
      .sort((a, b) => b[0].length - a[0].length);
    const phrasePattern = sortedEntries.map(([phrase]) => this.escapeRegex(this.escapeHtml(phrase))).join("|");
    const phraseRegex = phrasePattern ? new RegExp(`\\b(?:${phrasePattern})\\b`, "gi") : null;
    const glossaryMap = new Map(sortedEntries);

    const transformedLines = lines.map((line) => {
      if (!phraseRegex) {
        return line;
      }

      return line.replace(phraseRegex, (matchedText) => {
        const translation = glossaryMap.get(matchedText.toLowerCase());
        if (!translation) {
          return matchedText;
        }

        return `<span class="hint-word" data-ua="${this.escapeAttribute(translation)}">${matchedText}</span>`;
      });
    });

    containerElement.innerHTML = transformedLines.join("<br>");
  }

  applyHintsVisibilityClass() {
    const bodyClassList = document.body.classList;
    if (this.translationHintsEnabled) {
      bodyClassList.remove("hints-disabled");
    } else {
      bodyClassList.add("hints-disabled");
    }
  }

  updateTranslationToggleButtonLabel() {
    const buttonElement = this.elements.translationToggleButton;
    if (this.translationHintsEnabled) {
      buttonElement.textContent = "Ховати підказки перекладу";
      buttonElement.classList.remove("is-off");
    } else {
      buttonElement.textContent = "Показувати підказки перекладу";
      buttonElement.classList.add("is-off");
    }
  }

  setTaskPrompt(taskText) {
    this.elements.taskPrompt.textContent = taskText;
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  escapeAttribute(value) {
    return String(value).replace(/"/g, "&quot;");
  }

  escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
