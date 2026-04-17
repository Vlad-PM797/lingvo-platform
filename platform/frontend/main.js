const elements = {
  baseUrl: document.getElementById("baseUrl"),
  registerEmail: document.getElementById("registerEmail"),
  registerPassword: document.getElementById("registerPassword"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  registerButton: document.getElementById("registerButton"),
  loginButton: document.getElementById("loginButton"),
  output: document.getElementById("output"),
  loadCoursesButton: document.getElementById("loadCoursesButton"),
  courseSelect: document.getElementById("courseSelect"),
  lessonSelect: document.getElementById("lessonSelect"),
  openLessonButton: document.getElementById("openLessonButton"),
  learningOutput: document.getElementById("learningOutput"),
};

const STORAGE_KEYS = Object.freeze({
  backendUrl: "lingvo_backend_url",
  accessToken: "lingvo_access_token",
  refreshToken: "lingvo_refresh_token",
});

const appState = {
  courses: [],
  lessonsByCourseId: new Map(),
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

function setOutput(text, mode = "info") {
  elements.output.className = mode === "ok" ? "ok" : mode === "warn" ? "warn" : "";
  elements.output.textContent = text;
}

function normalizeBaseUrl(rawValue) {
  return String(rawValue || "").trim().replace(/\/+$/, "");
}

function getBaseUrlOrThrow() {
  const url = normalizeBaseUrl(elements.baseUrl.value);
  if (!url) {
    throw new Error("Вкажи Backend URL.");
  }
  return url;
}

async function requestJson(path, payload) {
  const baseUrl = getBaseUrlOrThrow();
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
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

async function requestAuthJson(path) {
  const baseUrl = getBaseUrlOrThrow();
  const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken);
  if (!accessToken) {
    throw new Error("Спочатку увійди в систему.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
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

async function handleRegister() {
  try {
    const email = String(elements.registerEmail.value || "").trim();
    const password = String(elements.registerPassword.value || "");
    if (!email || password.length < 8) {
      throw new Error("Вкажи валідний email і пароль від 8 символів.");
    }

    logInfo("auth.register.attempt", { email });
    const result = await requestJson("/auth/register", { email, password });
    logInfo("auth.register.success", { email });
    setOutput(`Користувач створений:\n${JSON.stringify(result, null, 2)}`, "ok");
  } catch (error) {
    logError("auth.register.failed", error);
    setOutput(`Помилка реєстрації:\n${error instanceof Error ? error.message : String(error)}`, "warn");
  }
}

async function handleLogin() {
  try {
    const email = String(elements.loginEmail.value || "").trim();
    const password = String(elements.loginPassword.value || "");
    if (!email || !password) {
      throw new Error("Вкажи email і пароль.");
    }

    logInfo("auth.login.attempt", { email });
    const result = await requestJson("/auth/login", { email, password });
    if (result.accessToken) {
      window.localStorage.setItem(STORAGE_KEYS.accessToken, result.accessToken);
    }
    if (result.refreshToken) {
      window.localStorage.setItem(STORAGE_KEYS.refreshToken, result.refreshToken);
    }
    logInfo("auth.login.success", { email });
    setOutput(`Вхід успішний. Токени збережено локально.\n${JSON.stringify(result, null, 2)}`, "ok");
    elements.learningOutput.textContent = "Вхід успішний. Натисни \"Завантажити курси\".";
    window.setTimeout(() => {
      void redirectToProjectPage();
    }, 700);
  } catch (error) {
    logError("auth.login.failed", error);
    setOutput(`Помилка входу:\n${error instanceof Error ? error.message : String(error)}`, "warn");
  }
}

async function redirectToProjectPage() {
  const primaryProjectPath = "/trainer";
  const fallbackProjectPath = "/trainer.html";
  try {
    const response = await fetch(primaryProjectPath, {
      method: "HEAD",
      cache: "no-store",
    });
    window.location.href = response.ok ? primaryProjectPath : fallbackProjectPath;
  } catch (error) {
    logError("auth.login.redirect_probe.failed", error);
    window.location.href = fallbackProjectPath;
  }
}

function renderCourseOptions() {
  elements.courseSelect.innerHTML = "";
  for (const course of appState.courses) {
    const option = document.createElement("option");
    option.value = course.id;
    option.textContent = `${course.title} (${course.lessonsCount ?? 0} уроків)`;
    elements.courseSelect.appendChild(option);
  }
}

function renderLessonOptions(courseId) {
  elements.lessonSelect.innerHTML = "";
  const lessons = appState.lessonsByCourseId.get(courseId) || [];
  for (const lesson of lessons) {
    const option = document.createElement("option");
    option.value = lesson.id;
    option.textContent = `${lesson.orderInCourse}. ${lesson.title}`;
    elements.lessonSelect.appendChild(option);
  }
}

async function handleLoadCourses() {
  try {
    logInfo("learning.courses.load.attempt");
    const payload = await requestAuthJson("/learning/courses");
    appState.courses = Array.isArray(payload.courses) ? payload.courses : [];
    renderCourseOptions();
    if (appState.courses.length === 0) {
      elements.learningOutput.textContent = "Курси не знайдено.";
      return;
    }
    await handleCourseChange();
    elements.learningOutput.textContent = `Курсів завантажено: ${appState.courses.length}`;
    logInfo("learning.courses.load.success", { count: appState.courses.length });
  } catch (error) {
    logError("learning.courses.load.failed", error);
    elements.learningOutput.textContent = `Помилка завантаження курсів:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

async function handleCourseChange() {
  const courseId = elements.courseSelect.value;
  if (!courseId) return;
  try {
    logInfo("learning.lessons.load.attempt", { courseId });
    let lessons = appState.lessonsByCourseId.get(courseId);
    if (!lessons) {
      const payload = await requestAuthJson(`/learning/courses/${courseId}/lessons`);
      lessons = Array.isArray(payload.lessons) ? payload.lessons : [];
      appState.lessonsByCourseId.set(courseId, lessons);
    }
    renderLessonOptions(courseId);
    logInfo("learning.lessons.load.success", { courseId, count: lessons.length });
  } catch (error) {
    logError("learning.lessons.load.failed", error, { courseId });
    elements.learningOutput.textContent = `Помилка завантаження уроків:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

async function handleOpenLesson() {
  const lessonId = elements.lessonSelect.value;
  if (!lessonId) {
    elements.learningOutput.textContent = "Спочатку обери урок.";
    return;
  }
  try {
    logInfo("learning.lesson.open.attempt", { lessonId });
    const lesson = await requestAuthJson(`/learning/lessons/${lessonId}`);
    const words = Array.isArray(lesson.words) ? lesson.words : [];
    const phrases = Array.isArray(lesson.phrases) ? lesson.phrases : [];
    const wordsPreview = words.slice(0, 12).map((item) => `- ${item.englishText} — ${item.translationUa}`).join("\n");
    const phrasesPreview = phrases.slice(0, 8).map((item) => `- ${item.englishText} — ${item.translationUa}`).join("\n");
    elements.learningOutput.textContent = [
      `Урок: ${lesson.title}`,
      ``,
      `Матеріал:`,
      `${lesson.materialUa || "(немає)"}`,
      ``,
      `Слова (${words.length}):`,
      wordsPreview || "(немає)",
      ``,
      `Фрази (${phrases.length}):`,
      phrasesPreview || "(немає)",
      ``,
      `Підказка: це MVP перегляд уроку через API. Далі можна додати повний інтерактив вправ тут.`,
    ].join("\n");
    logInfo("learning.lesson.open.success", { lessonId, words: words.length, phrases: phrases.length });
  } catch (error) {
    logError("learning.lesson.open.failed", error, { lessonId });
    elements.learningOutput.textContent = `Помилка відкриття уроку:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

function bootstrap() {
  const savedBackendUrl = window.localStorage.getItem(STORAGE_KEYS.backendUrl);
  if (savedBackendUrl) {
    elements.baseUrl.value = savedBackendUrl;
  }

  elements.baseUrl.addEventListener("change", () => {
    const normalized = normalizeBaseUrl(elements.baseUrl.value);
    elements.baseUrl.value = normalized;
    if (normalized) {
      window.localStorage.setItem(STORAGE_KEYS.backendUrl, normalized);
    }
  });

  elements.registerButton.addEventListener("click", handleRegister);
  elements.loginButton.addEventListener("click", handleLogin);
  elements.loadCoursesButton.addEventListener("click", handleLoadCourses);
  elements.courseSelect.addEventListener("change", () => {
    void handleCourseChange();
  });
  elements.openLessonButton.addEventListener("click", () => {
    void handleOpenLesson();
  });
}

bootstrap();
