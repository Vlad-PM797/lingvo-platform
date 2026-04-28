const PROJECT_ELEMENTS = {
  baseUrl: document.getElementById("baseUrl"),
<<<<<<< HEAD
  learningLanguageSelect: document.getElementById("learningLanguageSelect"),
  learningLanguageHint: document.getElementById("learningLanguageHint"),
=======
  targetLangSelect: document.getElementById("targetLangSelect"),
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
  loadCoursesButton: document.getElementById("loadCoursesButton"),
  loadProgressButton: document.getElementById("loadProgressButton"),
  logoutButton: document.getElementById("logoutButton"),
  courseSelect: document.getElementById("courseSelect"),
  lessonSelect: document.getElementById("lessonSelect"),
  openLessonButton: document.getElementById("openLessonButton"),
  lessonSceneMount: document.getElementById("lessonSceneMount"),
  lessonOutput: document.getElementById("lessonOutput"),
  answerInput: document.getElementById("answerInput"),
  submitAttemptButton: document.getElementById("submitAttemptButton"),
  attemptOutput: document.getElementById("attemptOutput"),
  loadTesterActivityTodayButton: document.getElementById("loadTesterActivityTodayButton"),
  loadTesterActivityButton: document.getElementById("loadTesterActivityButton"),
  testerActivityOutput: document.getElementById("testerActivityOutput"),
};

<<<<<<< HEAD
const authClient = window.LingvoAuthClient;
const learningLanguageClient = window.LingvoLearningLanguage;
const sharedUi = window.LingvoFrontendShared;
const sharedLearning = window.LingvoSharedLearning;
const logger = sharedUi.createConsoleLogger("project");
=======
const STORAGE_KEYS = Object.freeze({
  backendUrl: "lingvo_backend_url",
  accessToken: "lingvo_access_token",
  refreshToken: "lingvo_refresh_token",
  targetLang: "lingvo_target_lang",
});
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca

const PROJECT_MESSAGES = Object.freeze({
  loginRequired: "Сесія відсутня. Увійди ще раз.",
  lessonMissing: "Спочатку обери урок.",
  answerMissing: "Введи відповідь перед відправкою.",
});

const TARGET_LANG = Object.freeze({
  english: "en",
  italian: "it",
});

const projectState = {
  courses: [],
  lessonsByCourseId: new Map(),
  selectedLesson: null,
};

function getSelectedLearningLanguage() {
  if (PROJECT_ELEMENTS.learningLanguageSelect) {
    return learningLanguageClient.normalizeLanguageCode(PROJECT_ELEMENTS.learningLanguageSelect.value);
  }
  return learningLanguageClient.getCurrentLanguage();
}

function buildLearningQueryString() {
  const params = new URLSearchParams();
  params.set("learningLanguage", getSelectedLearningLanguage());
  params.set("translationLanguage", "ua");
  return `?${params.toString()}`;
}

function updateLearningLanguageUi() {
  const meta = learningLanguageClient.getLanguageMeta(getSelectedLearningLanguage());
  if (PROJECT_ELEMENTS.answerInput) {
    PROJECT_ELEMENTS.answerInput.placeholder = meta.answerPlaceholder;
  }
  if (PROJECT_ELEMENTS.learningLanguageHint) {
    PROJECT_ELEMENTS.learningLanguageHint.textContent = meta.code === "it"
      ? "Італійська доступна у starter-режимі: завантаж курси, щоб почати з базових уроків."
      : "Англійська доступна у starter-режимі. Можеш перемкнутися на італійську в цьому ж списку."
    ;
  }
}

function getLearningLanguageName(code) {
  return learningLanguageClient.getLanguageMeta(code).labelUa;
}

function getBaseUrlOrThrow() {
<<<<<<< HEAD
  return sharedUi.getBaseUrlOrThrow(authClient, PROJECT_ELEMENTS.baseUrl);
=======
  const fromInput = normalizeBaseUrl(PROJECT_ELEMENTS.baseUrl.value);
  if (fromInput) {
    return fromInput;
  }
  const fromStorage = normalizeBaseUrl(window.localStorage.getItem(STORAGE_KEYS.backendUrl));
  if (fromStorage) {
    return fromStorage;
  }
  if (typeof window !== "undefined" && window.LINGVO_PUBLIC_BACKEND_URL) {
    return normalizeBaseUrl(String(window.LINGVO_PUBLIC_BACKEND_URL));
  }
  throw new Error("Вкажи Backend URL або задай LINGVO_PUBLIC_BACKEND_URL у lingvoPublicConfig.js.");
}

function getAccessTokenOrThrow() {
  const token = window.localStorage.getItem(STORAGE_KEYS.accessToken);
  if (!token) {
    throw new Error(PROJECT_MESSAGES.loginRequired);
  }
  return token;
}

function getTargetLang() {
  const raw = String(PROJECT_ELEMENTS.targetLangSelect?.value || "").trim().toLowerCase();
  return raw === TARGET_LANG.italian ? TARGET_LANG.italian : TARGET_LANG.english;
}

async function requestAuthJson(path, method = "GET", payload = null) {
  const baseUrl = getBaseUrlOrThrow();
  const accessToken = getAccessTokenOrThrow();
  const requestOptions = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  if (payload) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(payload);
  }

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, requestOptions);
  } catch (error) {
    logError("project.request.network_error", error, { path, method });
    throw error;
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
}

function renderCourseOptions() {
  sharedUi.renderSelectOptions(
    PROJECT_ELEMENTS.courseSelect,
    projectState.courses,
    (course) => course.id,
    (course) => `${course.title} (${course.lessonsCount ?? course.lessons?.length ?? 0} уроків)`,
  );
}

function renderLessonOptions(courseId) {
  const lessons = projectState.lessonsByCourseId.get(courseId) || [];
  sharedUi.renderSelectOptions(
    PROJECT_ELEMENTS.lessonSelect,
    lessons,
    (lesson) => lesson.id,
    (lesson) => `${lesson.orderInCourse ?? lesson.ordinal ?? 0}. ${lesson.title}`,
  );
  try {
    if (window.LingvoTopicLessonVisuals && typeof window.LingvoTopicLessonVisuals.apply === "function") {
      const opt = PROJECT_ELEMENTS.lessonSelect.options[PROJECT_ELEMENTS.lessonSelect.selectedIndex];
      const text = String(opt?.textContent || "")
        .replace(/^\s*\d+\.[\s)]+/i, "")
        .trim();
      window.LingvoTopicLessonVisuals.apply({ title: text, code: "" });
    }
  } catch (error) {
    logger.error("topic_visuals.after_render_lessons", error, { courseId });
  }
}

async function loadCourses() {
  try {
    logger.info("courses.load.attempt");
    projectState.courses = await sharedLearning.fetchCourses(authClient, getBaseUrlOrThrow(), buildLearningQueryString());
    renderCourseOptions();

    if (projectState.courses.length === 0) {
      const meta = learningLanguageClient.getLanguageMeta(getSelectedLearningLanguage());
      PROJECT_ELEMENTS.lessonOutput.textContent = `Starter-курси для мови "${meta.labelUa}" тимчасово недоступні.`;
      return;
    }

    await handleCourseChange();
    PROJECT_ELEMENTS.lessonOutput.textContent = `Курсів завантажено: ${projectState.courses.length}`;
    logger.info("courses.load.success", { count: projectState.courses.length });
  } catch (error) {
    logger.error("courses.load.failed", error);
    PROJECT_ELEMENTS.lessonOutput.textContent = `Помилка завантаження курсів:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

async function handleCourseChange() {
  const courseId = PROJECT_ELEMENTS.courseSelect.value;
  if (!courseId) {
    return;
  }

  try {
    let lessons = projectState.lessonsByCourseId.get(courseId);
    if (!lessons) {
      logger.info("lessons.load.attempt", { courseId });
      lessons = await sharedLearning.fetchLessonsByCourseId(authClient, getBaseUrlOrThrow(), courseId, buildLearningQueryString());
      projectState.lessonsByCourseId.set(courseId, lessons);
      logger.info("lessons.load.success", { courseId, count: lessons.length });
    }
    renderLessonOptions(courseId);
  } catch (error) {
    logger.error("lessons.load.failed", error, { courseId });
    PROJECT_ELEMENTS.lessonOutput.textContent = `Помилка завантаження уроків:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

function clearLessonSceneMount() {
  const mount = PROJECT_ELEMENTS.lessonSceneMount;
  if (!mount) {
    return;
  }
  mount.innerHTML = "";
  mount.hidden = true;
}

function resolveSceneAssetUrl(relativePath) {
  try {
    return new URL(String(relativePath || ""), window.location.href).href;
  } catch {
    return String(relativePath || "");
  }
}

function showLessonScenesEmptyHelp(lesson) {
  const mount = PROJECT_ELEMENTS.lessonSceneMount;
  if (!mount) {
    return;
  }
  const lessonCode = String(lesson.code || "");
  const isMvpLesson = lessonCode === "a0-basics-01" || lessonCode === "a0-basics-02";
  mount.hidden = false;
  mount.innerHTML = "";
  const paragraph = document.createElement("p");
  paragraph.className = "lesson-scene-empty";
  if (isMvpLesson) {
    paragraph.textContent =
      "Для цього уроку вже мають бути ілюстрації, але API не повернув scene-дані. Найчастіше на сервері БД не застосовано міграцію 005_lesson_dialogue_scenes.sql — виконай її й перезапусти бекенд.";
  } else {
    paragraph.textContent = `Ілюстрації MVP поки лише для перших двох уроків (Basics 01 / 02). Зараз обрано: ${lesson.title || "урок"}.`;
  }
  mount.appendChild(paragraph);
}

function resolveLessonScenesWithFrontendFallback(lesson) {
  const scenesFromApi = Array.isArray(lesson?.dialogueScenes) ? lesson.dialogueScenes : [];
  if (scenesFromApi.length > 0) {
    return scenesFromApi;
  }
  const lessonCode = String(lesson?.code || "");
  const catalog = window.LingvoLessonScenes;
  if (catalog && typeof catalog.getByLessonCode === "function") {
    return catalog.getByLessonCode(lessonCode);
  }
  return [];
}

function renderLessonScenes(lesson) {
  const mount = PROJECT_ELEMENTS.lessonSceneMount;
  if (!mount) {
    return;
  }
  const scenes = resolveLessonScenesWithFrontendFallback(lesson);
  const phrases = Array.isArray(lesson.phrases) ? lesson.phrases : [];
  if (scenes.length === 0) {
    showLessonScenesEmptyHelp(lesson);
    return;
  }
  const phraseByIndex = new Map(phrases.map((phrase) => [Number(phrase.ordinal), phrase]));
  mount.hidden = false;
  mount.innerHTML = "";
  const heading = document.createElement("h3");
  heading.className = "lesson-scene-heading";
  heading.textContent = "Сцени до діалогів (MVP)";
  mount.appendChild(heading);
  for (const scene of scenes) {
    const ordinal = Number(scene.dialogueIndex);
    const phrase = phraseByIndex.get(ordinal);
    const card = document.createElement("article");
    card.className = "lesson-scene-card";
    const figure = document.createElement("div");
    figure.className = "lesson-scene-figure";
    const img = document.createElement("img");
    img.src = resolveSceneAssetUrl(scene.svgPath);
    img.alt = String(scene.altTextUa || "");
    img.width = 280;
    img.height = 210;
    img.loading = "lazy";
    figure.appendChild(img);
    const caption = document.createElement("div");
    caption.className = "lesson-scene-caption";
    const enLine = document.createElement("p");
    enLine.className = "lesson-scene-en";
    enLine.textContent = String(phrase?.en || `Scene #${ordinal}`);
    const uaLine = document.createElement("p");
    uaLine.className = "lesson-scene-ua";
    uaLine.textContent = String(phrase?.ua || scene.altTextUa || "");
    caption.appendChild(enLine);
    caption.appendChild(uaLine);
    card.appendChild(figure);
    card.appendChild(caption);
    mount.appendChild(card);
  }
}

async function openLesson() {
  const lessonId = PROJECT_ELEMENTS.lessonSelect.value;
  if (!lessonId) {
    clearLessonSceneMount();
    try {
      if (window.LingvoTopicLessonVisuals && typeof window.LingvoTopicLessonVisuals.clear === "function") {
        window.LingvoTopicLessonVisuals.clear();
      }
    } catch (error) {
      logger.error("topic_visuals.clear", error);
    }
    PROJECT_ELEMENTS.lessonOutput.textContent = PROJECT_MESSAGES.lessonMissing;
    return;
  }

  try {
<<<<<<< HEAD
    logger.info("lesson.open.attempt", { lessonId });
    clearLessonSceneMount();
    const lesson = await sharedLearning.fetchLessonById(authClient, getBaseUrlOrThrow(), lessonId);
=======
    const targetLang = getTargetLang();
    logInfo("project.lesson.open.attempt", { lessonId });
    clearLessonSceneMount();
    const lesson = await requestAuthJson(`/learning/lessons/${lessonId}?targetLang=${encodeURIComponent(targetLang)}`);
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
    projectState.selectedLesson = lesson;

    const learningLanguageName = getLearningLanguageName(lesson.learningLanguage || getSelectedLearningLanguage());

<<<<<<< HEAD
    PROJECT_ELEMENTS.lessonOutput.textContent = sharedLearning.formatLessonPreview(lesson, {
      headingLines: [
        `Урок: ${lesson.title}`,
        `Мова навчання: ${learningLanguageName}`,
        ``,
        `Опис:`,
        `${lesson.description || "(немає)"}`,
        ``,
      ],
      wordLimit: 20,
      phraseLimit: 14,
    });
=======
    const wordsPreview = words.slice(0, 20).map((item) => `- ${item.en} — ${item.ua}`).join("\n");
    const phrasesPreview = phrases.slice(0, 14).map((item) => `- ${item.en} — ${item.ua}`).join("\n");

    PROJECT_ELEMENTS.lessonOutput.textContent = [
      `Урок: ${lesson.title}`,
      `Мова вивчення: ${targetLang === TARGET_LANG.italian ? "Італійська" : "Англійська"}`,
      ``,
      `Опис:`,
      `${lesson.description || "(немає)"}`,
      ``,
      `Слова (${words.length}):`,
      wordsPreview || "(немає)",
      ``,
      `Фрази (${phrases.length}):`,
      phrasesPreview || "(немає)",
    ].join("\n");
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
    const scenes = resolveLessonScenesWithFrontendFallback(lesson);
    renderLessonScenes({ ...lesson, dialogueScenes: scenes });
    try {
      window.dispatchEvent(
        new CustomEvent("lingvo-lesson-context", {
          detail: { title: lesson.title || "", code: lesson.code || "" },
        }),
      );
    } catch (error) {
      logger.error("lesson.context_event", error, { lessonId });
    }
  } catch (error) {
    logger.error("lesson.open.failed", error, { lessonId });
    clearLessonSceneMount();
    try {
      if (window.LingvoTopicLessonVisuals && typeof window.LingvoTopicLessonVisuals.clear === "function") {
        window.LingvoTopicLessonVisuals.clear();
      }
    } catch (clearError) {
      logger.error("topic_visuals.clear_after_error", clearError);
    }
    PROJECT_ELEMENTS.lessonOutput.textContent = `Помилка відкриття уроку:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

async function submitAttempt() {
  if (!projectState.selectedLesson?.id) {
    PROJECT_ELEMENTS.attemptOutput.textContent = PROJECT_MESSAGES.lessonMissing;
    return;
  }

  const answerText = String(PROJECT_ELEMENTS.answerInput.value || "").trim();
  if (!answerText) {
    PROJECT_ELEMENTS.attemptOutput.textContent = PROJECT_MESSAGES.answerMissing;
    return;
  }

  const expectedAnswers = (projectState.selectedLesson.phrases || [])
    .slice(0, 2)
    .map((item) => sharedUi.getLearningText(item))
    .filter(Boolean);
  if (expectedAnswers.length === 0) {
    PROJECT_ELEMENTS.attemptOutput.textContent = "Для цього уроку немає фраз для перевірки відповіді.";
    return;
  }
  const sourceText = sharedUi.getTranslationText((projectState.selectedLesson.phrases || [])[0])
    || projectState.selectedLesson.title
    || "lesson_prompt";

  try {
    logger.info("attempt.submit.attempt", { lessonId: projectState.selectedLesson.id });
    const result = await sharedLearning.requestLearningJson(
      authClient,
      getBaseUrlOrThrow(),
      "/learning/progress/attempts",
      {
        method: "POST",
        body: {
          lessonId: projectState.selectedLesson.id,
          promptType: "translation",
          sourceText,
          expectedAnswers,
          userAnswer: answerText,
        },
      },
    );
    PROJECT_ELEMENTS.attemptOutput.textContent = [
      `Результат: ${result.isCorrect ? "правильно" : "неправильно"}`,
      `Прийнята відповідь: ${result.acceptedAnswer}`,
      `Спроб: ${result.attemptsCount}`,
      `Правильних: ${result.correctCount}`,
      `Точність: ${result.accuracyPercent}%`,
    ].join("\n");
    logger.info("attempt.submit.success", { lessonId: projectState.selectedLesson.id, isCorrect: result.isCorrect });
  } catch (error) {
    logger.error("attempt.submit.failed", error, { lessonId: projectState.selectedLesson.id });
    PROJECT_ELEMENTS.attemptOutput.textContent = `Помилка відправки відповіді:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

async function loadProgress() {
  try {
    logger.info("progress.load.attempt");
    const progress = await sharedLearning.requestLearningJson(
      authClient,
      getBaseUrlOrThrow(),
      "/learning/progress/me",
    );
    PROJECT_ELEMENTS.attemptOutput.textContent = [
      `Загальний прогрес:`,
      `Спроб: ${progress.totals?.attemptsCount ?? 0}`,
      `Правильних: ${progress.totals?.correctCount ?? 0}`,
      `Точність: ${progress.totals?.accuracyPercent ?? 0}%`,
      `Завершено уроків: ${progress.totals?.completedLessonsCount ?? 0}`,
    ].join("\n");
    logger.info("progress.load.success");
  } catch (error) {
    logger.error("progress.load.failed", error);
    PROJECT_ELEMENTS.attemptOutput.textContent = `Помилка завантаження прогресу:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${hours}г ${minutes}хв ${seconds}с`;
}

async function loadTesterActivity(hours = 168) {
  try {
    const safeHours = Number.isInteger(hours) && hours > 0 ? hours : 168;
    logInfo("project.testers_activity.load.attempt", { hours: safeHours });
    const payload = await requestAuthJson(`/admin/testers/activity?hours=${safeHours}&limit=150`);
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    if (rows.length === 0) {
      PROJECT_ELEMENTS.testerActivityOutput.textContent = "За обраний період активність не знайдена.";
      return;
    }
    const lines = rows.map((row, index) => {
      const shortUa = String(row.userAgent || "").slice(0, 80);
      return [
        `${index + 1}. ${row.email}`,
        `   userId: ${row.userId}`,
        `   IP: ${row.ipAddress}`,
        `   Origin: ${row.origin || "(немає)"}`,
        `   User-Agent: ${shortUa}${String(row.userAgent || "").length > 80 ? "..." : ""}`,
        `   Запитів: ${row.totalRequests}`,
        `   Період: ${row.firstSeenAt} -> ${row.lastSeenAt}`,
        `   Тривалість: ${formatDuration(row.durationSeconds)}`,
      ].join("\n");
    });
    PROJECT_ELEMENTS.testerActivityOutput.textContent = [
      `Період звіту: останні ${payload.hours || safeHours} год`,
      `Рядків: ${rows.length}`,
      "",
      ...lines,
    ].join("\n");
    logInfo("project.testers_activity.load.success", { count: rows.length, hours: safeHours });
  } catch (error) {
    logError("project.testers_activity.load.failed", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("HTTP 403")) {
      PROJECT_ELEMENTS.testerActivityOutput.textContent =
        "Немає доступу. Цей блок доступний лише для admin-користувача.";
      return;
    }
    PROJECT_ELEMENTS.testerActivityOutput.textContent = `Помилка завантаження активності:\n${message}`;
  }
}

function logout() {
  authClient.logout({ baseUrl: getBaseUrlOrThrow() })
    .catch((error) => {
      logger.error("logout.failed", error);
    })
    .finally(() => {
      window.location.href = "./remote-test.html";
    });
}

async function bootstrap() {
  sharedUi.populateBackendUrlInput(PROJECT_ELEMENTS.baseUrl, authClient);

<<<<<<< HEAD
  const accessToken = await authClient.restoreSession({
    baseUrl: PROJECT_ELEMENTS.baseUrl.value,
  });
=======
  const savedTargetLang = String(window.localStorage.getItem(STORAGE_KEYS.targetLang) || "").trim().toLowerCase();
  if (PROJECT_ELEMENTS.targetLangSelect) {
    PROJECT_ELEMENTS.targetLangSelect.value =
      savedTargetLang === TARGET_LANG.italian ? TARGET_LANG.italian : TARGET_LANG.english;
  }

  const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken);
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
  if (!accessToken) {
    window.location.href = "./remote-test.html";
    return;
  }

  sharedUi.bindBackendUrlInput(PROJECT_ELEMENTS.baseUrl, authClient);

  if (PROJECT_ELEMENTS.learningLanguageSelect) {
    PROJECT_ELEMENTS.learningLanguageSelect.value = learningLanguageClient.getCurrentLanguage();
    PROJECT_ELEMENTS.learningLanguageSelect.addEventListener("change", () => {
      projectState.courses = [];
      projectState.lessonsByCourseId = new Map();
      projectState.selectedLesson = null;
      updateLearningLanguageUi();
      void loadCourses();
    });
  }
  window.addEventListener("lingvo-learning-language-changed", () => {
    updateLearningLanguageUi();
  });
<<<<<<< HEAD
  updateLearningLanguageUi();
=======
  PROJECT_ELEMENTS.targetLangSelect?.addEventListener("change", () => {
    const value = getTargetLang();
    window.localStorage.setItem(STORAGE_KEYS.targetLang, value);
    if (projectState.selectedLesson?.id) {
      void openLesson();
    }
  });
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca

  PROJECT_ELEMENTS.loadCoursesButton.addEventListener("click", () => {
    void loadCourses();
  });
  PROJECT_ELEMENTS.loadProgressButton.addEventListener("click", () => {
    void loadProgress();
  });
  PROJECT_ELEMENTS.logoutButton.addEventListener("click", logout);
  PROJECT_ELEMENTS.courseSelect.addEventListener("change", () => {
    void handleCourseChange();
  });
  PROJECT_ELEMENTS.openLessonButton.addEventListener("click", () => {
    void openLesson();
  });
  PROJECT_ELEMENTS.submitAttemptButton.addEventListener("click", () => {
    void submitAttempt();
  });
  PROJECT_ELEMENTS.loadTesterActivityButton.addEventListener("click", () => {
    void loadTesterActivity(168);
  });
  PROJECT_ELEMENTS.loadTesterActivityTodayButton.addEventListener("click", () => {
    void loadTesterActivity(24);
  });

  void loadCourses();
}

void bootstrap();
