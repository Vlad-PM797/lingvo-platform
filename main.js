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
const sharedUi = window.LingvoFrontendShared;
const sharedLearning = window.LingvoSharedLearning;
const logger = sharedUi.createConsoleLogger("portal");

const appState = {
  courses: [],
  lessonsByCourseId: new Map(),
};

function setOutput(text, mode = "info") {
  elements.output.className = mode === "ok" ? "ok" : mode === "warn" ? "warn" : "";
  elements.output.textContent = text;
}

function getBaseUrlOrThrow() {
  return sharedUi.getBaseUrlOrThrow(authClient, elements.baseUrl);
}

async function handleRegister() {
  try {
    const email = String(elements.registerEmail.value || "").trim();
    const password = String(elements.registerPassword.value || "");
    if (!email || password.length < 8) {
      throw new Error("Вкажи валідний email і пароль від 8 символів.");
    }

    logger.info("auth.register.attempt", { email });
    const result = await authClient.register({ email, password }, { baseUrl: getBaseUrlOrThrow() });
    logger.info("auth.register.success", { email });
    setOutput(`Користувач створений:\n${JSON.stringify(result, null, 2)}`, "ok");
  } catch (error) {
    logger.error("auth.register.failed", error);
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

    logger.info("auth.login.attempt", { email });
    const result = await authClient.login({ email, password }, { baseUrl: getBaseUrlOrThrow() });
    logger.info("auth.login.success", { email });
    setOutput(`Вхід успішний. Сесію створено.\n${JSON.stringify(result, null, 2)}`, "ok");
    elements.learningOutput.textContent = "Вхід успішний. Натисни \"Завантажити курси\".";
    window.setTimeout(() => {
      redirectToProjectPage();
    }, 700);
  } catch (error) {
    logger.error("auth.login.failed", error);
    setOutput(`Помилка входу:\n${error instanceof Error ? error.message : String(error)}`, "warn");
  }
}

function redirectToProjectPage() {
  window.location.href = "./project.html";
}

function renderCourseOptions() {
  sharedUi.renderSelectOptions(
    elements.courseSelect,
    appState.courses,
    (course) => course.id,
    (course) => `${course.title} (${course.lessonsCount ?? 0} уроків)`,
  );
}

function renderLessonOptions(courseId) {
  const lessons = appState.lessonsByCourseId.get(courseId) || [];
  sharedUi.renderSelectOptions(
    elements.lessonSelect,
    lessons,
    (lesson) => lesson.id,
    (lesson) => `${lesson.orderInCourse}. ${lesson.title}`,
  );
}

async function handleLoadCourses() {
  try {
    logger.info("learning.courses.load.attempt");
    appState.courses = await sharedLearning.fetchCourses(authClient, getBaseUrlOrThrow());
    renderCourseOptions();
    if (appState.courses.length === 0) {
      elements.learningOutput.textContent = "Курси не знайдено.";
      return;
    }
    await handleCourseChange();
    elements.learningOutput.textContent = `Курсів завантажено: ${appState.courses.length}`;
    logger.info("learning.courses.load.success", { count: appState.courses.length });
  } catch (error) {
    logger.error("learning.courses.load.failed", error);
    elements.learningOutput.textContent = `Помилка завантаження курсів:\n${error instanceof Error ? error.message : String(error)}`;
  }
}

async function handleCourseChange() {
  const courseId = elements.courseSelect.value;
  if (!courseId) return;
  try {
    logger.info("learning.lessons.load.attempt", { courseId });
    let lessons = appState.lessonsByCourseId.get(courseId);
    if (!lessons) {
      lessons = await sharedLearning.fetchLessonsByCourseId(authClient, getBaseUrlOrThrow(), courseId);
      appState.lessonsByCourseId.set(courseId, lessons);
    }
    renderLessonOptions(courseId);
    logger.info("learning.lessons.load.success", { courseId, count: lessons.length });
  } catch (error) {
    logger.error("learning.lessons.load.failed", error, { courseId });
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
    logger.info("learning.lesson.open.attempt", { lessonId });
    const lesson = await sharedLearning.fetchLessonById(authClient, getBaseUrlOrThrow(), lessonId);
    elements.learningOutput.textContent = sharedLearning.formatLessonPreview(lesson, {
      headingLines: [
        `Урок: ${lesson.title}`,
        `Мова навчання: ${lesson.learningLanguage || "en"}`,
        ``,
        `Матеріал:`,
        `${lesson.materialUa || "(немає)"}`,
        ``,
      ],
      trailingLines: [
        ``,
        `Підказка: це MVP перегляд уроку через API. Далі можна додати повний інтерактив вправ тут.`,
      ],
      wordLimit: 12,
      phraseLimit: 8,
    });
    logger.info("learning.lesson.open.success", {
      lessonId,
      words: Array.isArray(lesson.words) ? lesson.words.length : 0,
      phrases: Array.isArray(lesson.phrases) ? lesson.phrases.length : 0,
    });
  } catch (error) {
    logger.error("learning.lesson.open.failed", error, { lessonId });
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
    logger.error("portal.backend_ui_mode.failed", error);
  }
}

function bootstrap() {
  sharedUi.populateBackendUrlInput(elements.baseUrl, authClient);
  sharedUi.bindBackendUrlInput(elements.baseUrl, authClient);

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
