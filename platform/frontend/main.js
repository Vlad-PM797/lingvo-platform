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

const authClient = window.LingvoAuthClient;

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

function resolveBackendUrlForPortal() {
  return authClient.resolveBackendUrl({
    inputValue: elements.baseUrl ? elements.baseUrl.value : "",
  });
}

function getBaseUrlOrThrow() {
  return authClient.getBaseUrlOrThrow({
    inputValue: elements.baseUrl ? elements.baseUrl.value : "",
  });
}

async function handleRegister() {
  try {
    const email = String(elements.registerEmail.value || "").trim();
    const password = String(elements.registerPassword.value || "");
    if (!email || password.length < 8) {
      throw new Error("Вкажи валідний email і пароль від 8 символів.");
    }

    logInfo("auth.register.attempt", { email });
    const result = await authClient.register({ email, password }, { baseUrl: getBaseUrlOrThrow() });
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
    const result = await authClient.login({ email, password }, { baseUrl: getBaseUrlOrThrow() });
    logInfo("auth.login.success", { email });
    setOutput(`Вхід успішний. Сесію створено.\n${JSON.stringify(result, null, 2)}`, "ok");
    elements.learningOutput.textContent = "Вхід успішний. Натисни \"Завантажити курси\".";
    window.setTimeout(() => {
      redirectToProjectPage();
    }, 700);
  } catch (error) {
    logError("auth.login.failed", error);
    setOutput(`Помилка входу:\n${error instanceof Error ? error.message : String(error)}`, "warn");
  }
}

function redirectToProjectPage() {
  window.location.href = "./project.html";
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
    const payload = await authClient.request("/learning/courses", {
      baseUrl: getBaseUrlOrThrow(),
      auth: true,
    });
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
      const payload = await authClient.request(`/learning/courses/${courseId}/lessons`, {
        baseUrl: getBaseUrlOrThrow(),
        auth: true,
      });
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
    const lesson = await authClient.request(`/learning/lessons/${lessonId}`, {
      baseUrl: getBaseUrlOrThrow(),
      auth: true,
    });
    const words = Array.isArray(lesson.words) ? lesson.words : [];
    const phrases = Array.isArray(lesson.phrases) ? lesson.phrases : [];
    const wordsPreview = words.slice(0, 12).map((item) => `- ${item.learningText || item.en} — ${item.translationText || item.ua}`).join("\n");
    const phrasesPreview = phrases.slice(0, 8).map((item) => `- ${item.learningText || item.en} — ${item.translationText || item.ua}`).join("\n");
    elements.learningOutput.textContent = [
      `Урок: ${lesson.title}`,
      `Мова навчання: ${lesson.learningLanguage || "en"}`,
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

function applyPortalBackendUiMode() {
  try {
    const publicUrl = authClient.getPublicBackendUrl();
    const advanced = new URLSearchParams(window.location.search).has("advanced");
    const card = document.getElementById("portalBackendCard");
    const summaryCard = document.getElementById("portalBackendSummaryCard");
    const summaryText = document.getElementById("portalBackendSummaryText");
    if (!elements.baseUrl) {
      return;
    }
    if (publicUrl && !advanced) {
      elements.baseUrl.value = publicUrl;
      authClient.setBackendUrl(publicUrl);
      if (card) {
        card.hidden = true;
      }
      if (summaryCard && summaryText) {
        summaryText.textContent = `Підключення до сервера: ${publicUrl}`;
        summaryCard.hidden = false;
      }
    } else {
      if (card) {
        card.hidden = false;
      }
      if (summaryCard) {
        summaryCard.hidden = true;
      }
    }
  } catch (error) {
    logError("portal.backend_ui_mode.failed", error);
  }
}

function bootstrap() {
  const savedBackendUrl = authClient.getStoredBackendUrl();
  if (savedBackendUrl) {
    elements.baseUrl.value = savedBackendUrl;
  } else if (authClient.getPublicBackendUrl()) {
    elements.baseUrl.value = authClient.getPublicBackendUrl();
  }

  elements.baseUrl.addEventListener("change", () => {
    const normalized = authClient.normalizeBaseUrl(elements.baseUrl.value);
    elements.baseUrl.value = normalized;
    authClient.setBackendUrl(normalized);
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

  applyPortalBackendUiMode();
}

bootstrap();
