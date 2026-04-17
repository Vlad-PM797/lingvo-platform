const PROJECT_ELEMENTS = {
  baseUrl: document.getElementById("baseUrl"),
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
};

const STORAGE_KEYS = Object.freeze({
  backendUrl: "lingvo_backend_url",
  accessToken: "lingvo_access_token",
  refreshToken: "lingvo_refresh_token",
});

const PROJECT_MESSAGES = Object.freeze({
  loginRequired: "Сесія відсутня. Увійди ще раз.",
  lessonMissing: "Спочатку обери урок.",
  answerMissing: "Введи відповідь перед відправкою.",
});

const projectState = {
  courses: [],
  lessonsByCourseId: new Map(),
  selectedLesson: null,
};

function logInfo(operationName, payload = {}) {
  console.info(`[INFO] ${operationName}`, payload);
}

function logError(operationName, error, payload = {}) {
  console.error(`[ERROR] ${operationName}`, {
    message: error instanceof Error ? error.message : String(error),
    payload,
  });
}

function normalizeBaseUrl(rawValue) {
  return String(rawValue || "").trim().replace(/\/+$/, "");
}

function getBaseUrlOrThrow() {
  const value = normalizeBaseUrl(PROJECT_ELEMENTS.baseUrl.value);
  if (!value) {
    throw new Error("Вкажи Backend URL.");
  }
  return value;
}

function getAccessTokenOrThrow() {
  const token = window.localStorage.getItem(STORAGE_KEYS.accessToken);
  if (!token) {
    throw new Error(PROJECT_MESSAGES.loginRequired);
  }
  return token;
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
}

function renderCourseOptions() {
  PROJECT_ELEMENTS.courseSelect.innerHTML = "";
  for (const course of projectState.courses) {
    const option = document.createElement("option");
    option.value = course.id;
    option.textContent = `${course.title} (${course.lessonsCount ?? course.lessons?.length ?? 0} уроків)`;
    PROJECT_ELEMENTS.courseSelect.appendChild(option);
  }
}

function renderLessonOptions(courseId) {
  PROJECT_ELEMENTS.lessonSelect.innerHTML = "";
  const lessons = projectState.lessonsByCourseId.get(courseId) || [];
  for (const lesson of lessons) {
    const option = document.createElement("option");
    option.value = lesson.id;
    option.textContent = `${lesson.orderInCourse ?? lesson.ordinal ?? 0}. ${lesson.title}`;
    PROJECT_ELEMENTS.lessonSelect.appendChild(option);
  }
  try {
    if (window.LingvoTopicLessonVisuals && typeof window.LingvoTopicLessonVisuals.apply === "function") {
      const opt = PROJECT_ELEMENTS.lessonSelect.options[PROJECT_ELEMENTS.lessonSelect.selectedIndex];
      const text = String(opt?.textContent || "")
        .replace(/^\s*\d+\.[\s)]+/i, "")
        .trim();
      window.LingvoTopicLessonVisuals.apply({ title: text, code: "" });
    }
  } catch (error) {
    logError("project.topic_visuals.after_render_lessons", error, { courseId });
  }
}

async function loadCourses() {
  try {
    logInfo("project.courses.load.attempt");
    const payload = await requestAuthJson("/learning/courses");
    projectState.courses = Array.isArray(payload.courses) ? payload.courses : [];
    renderCourseOptions();

    if (projectState.courses.length === 0) {
      PROJECT_ELEMENTS.lessonOutput.textContent = "Курси не знайдено.";
      return;
    }

    await handleCourseChange();
    PROJECT_ELEMENTS.lessonOutput.textContent = `Курсів завантажено: ${projectState.courses.length}`;
    logInfo("project.courses.load.success", { count: projectState.courses.length });
  } catch (error) {
    logError("project.courses.load.failed", error);
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
      logInfo("project.lessons.load.attempt", { courseId });
      const payload = await requestAuthJson(`/learning/courses/${courseId}/lessons`);
      lessons = Array.isArray(payload.lessons) ? payload.lessons : [];
      projectState.lessonsByCourseId.set(courseId, lessons);
      logInfo("project.lessons.load.success", { courseId, count: lessons.length });
    }
    renderLessonOptions(courseId);
  } catch (error) {
    logError("project.lessons.load.failed", error, { courseId });
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
      logError("project.topic_visuals.clear", error);
    }
    PROJECT_ELEMENTS.lessonOutput.textContent = PROJECT_MESSAGES.lessonMissing;
    return;
  }

  try {
    logInfo("project.lesson.open.attempt", { lessonId });
    clearLessonSceneMount();
    const lesson = await requestAuthJson(`/learning/lessons/${lessonId}`);
    projectState.selectedLesson = lesson;

    const words = Array.isArray(lesson.words) ? lesson.words : [];
    const phrases = Array.isArray(lesson.phrases) ? lesson.phrases : [];

    const wordsPreview = words.slice(0, 20).map((item) => `- ${item.en} — ${item.ua}`).join("\n");
    const phrasesPreview = phrases.slice(0, 14).map((item) => `- ${item.en} — ${item.ua}`).join("\n");

    PROJECT_ELEMENTS.lessonOutput.textContent = [
      `Урок: ${lesson.title}`,
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
    const scenes = resolveLessonScenesWithFrontendFallback(lesson);
    renderLessonScenes({ ...lesson, dialogueScenes: scenes });
    try {
      window.dispatchEvent(
        new CustomEvent("lingvo-lesson-context", {
          detail: { title: lesson.title || "", code: lesson.code || "" },
        }),
      );
    } catch (error) {
      logError("project.lesson.context_event", error, { lessonId });
    }
  } catch (error) {
    logError("project.lesson.open.failed", error, { lessonId });
    clearLessonSceneMount();
    try {
      if (window.LingvoTopicLessonVisuals && typeof window.LingvoTopicLessonVisuals.clear === "function") {
        window.LingvoTopicLessonVisuals.clear();
      }
    } catch (clearError) {
      logError("project.topic_visuals.clear_after_error", clearError);
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
    .map((item) => item.en)
    .filter(Boolean);
  if (expectedAnswers.length === 0) {
    PROJECT_ELEMENTS.attemptOutput.textContent = "Для цього уроку немає фраз для перевірки відповіді.";
    return;
  }
  const sourceText = (projectState.selectedLesson.phrases || [])[0]?.ua || projectState.selectedLesson.title || "lesson_prompt";

  try {
    logInfo("project.attempt.submit.attempt", { lessonId: projectState.selectedLesson.id });
    const result = await requestAuthJson("/learning/progress/attempts", "POST", {
      lessonId: projectState.selectedLesson.id,
      promptType: "translation",
      sourceText,
      expectedAnswers,
      userAnswer: answerText,
    });
    PROJECT_ELEMENTS.attemptOutput.textContent = [
      `Результат: ${result.isCorrect ? "правильно" : "неправильно"}`,
      `Прийнята відповідь: ${result.acceptedAnswer}`,
      `Спроб: ${result.attemptsCount}`,
      `Правильних: ${result.correctCount}`,
      `Точність: ${result.accuracyPercent}%`,
    ].join("\n");
    logInfo("project.attempt.submit.success", { lessonId: projectState.selectedLesson.id, isCorrect: result.isCorrect });
  } catch (error) {
    logError("project.attempt.submit.failed", error, { lessonId: projectState.selectedLesson.id });
    PROJECT_ELEMENTS.attemptOutput.textContent = `Помилка відправки відповіді:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

async function loadProgress() {
  try {
    logInfo("project.progress.load.attempt");
    const progress = await requestAuthJson("/learning/progress/me");
    PROJECT_ELEMENTS.attemptOutput.textContent = [
      `Загальний прогрес:`,
      `Спроб: ${progress.totals?.attemptsCount ?? 0}`,
      `Правильних: ${progress.totals?.correctCount ?? 0}`,
      `Точність: ${progress.totals?.accuracyPercent ?? 0}%`,
      `Завершено уроків: ${progress.totals?.completedLessonsCount ?? 0}`,
    ].join("\n");
    logInfo("project.progress.load.success");
  } catch (error) {
    logError("project.progress.load.failed", error);
    PROJECT_ELEMENTS.attemptOutput.textContent = `Помилка завантаження прогресу:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

function logout() {
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
  window.location.href = "./portal.html";
}

function bootstrap() {
  const savedBackendUrl = window.localStorage.getItem(STORAGE_KEYS.backendUrl);
  if (savedBackendUrl) {
    PROJECT_ELEMENTS.baseUrl.value = savedBackendUrl;
  }

  const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken);
  if (!accessToken) {
    window.location.href = "./portal.html";
    return;
  }

  PROJECT_ELEMENTS.baseUrl.addEventListener("change", () => {
    const normalized = normalizeBaseUrl(PROJECT_ELEMENTS.baseUrl.value);
    PROJECT_ELEMENTS.baseUrl.value = normalized;
    if (normalized) {
      window.localStorage.setItem(STORAGE_KEYS.backendUrl, normalized);
    }
  });

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

  void loadCourses();
}

bootstrap();
