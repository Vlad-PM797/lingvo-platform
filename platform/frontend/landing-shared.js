export const AUTH_COPY = Object.freeze({
  loginTitle: "Вхід",
  loginSub: "Два кроки: пошта → пароль.",
  registerTitle: "Реєстрація",
  registerSub: "Google або пошта, потім пароль з підтвердженням.",
  stepAccount: "Крок 1 з 2 · акаунт",
  stepPasswordLogin: "Крок 2 з 2 · пароль",
  stepPasswordRegister: "Крок 2 з 2 · пароль і підтвердження",
  forgotTitle: "Відновлення паролю",
  forgotSub: "Лист надійде на пошту, вказану при реєстрації.",
  forgotSuccess: "Якщо такий акаунт існує, ми надіслали лист із посиланням для нового паролю. Перевір пошту (і спам).",
  googleDemo: "Демо: тут буде redirect на Google OAuth. Після інтеграції бекенду користувач повернеться вже авторизованим.",
  loginDemo: "Демо: вхід успішний (підключи API логіну).",
  registerDemo: "Демо: акаунт створено (підключи API реєстрації).",
  emailInvalid: "Введи коректну електронну пошту.",
  passwordShort: "Пароль має бути не коротший за 8 символів.",
  passwordMismatch: "Паролі не збігаються. Введи однаково в обох полях.",
  loginPasswordEmpty: "Введи пароль.",
  loginPasswordShort: "Пароль має бути не коротший за 8 символів.",
  registerPasswordEmpty: "Заповни пароль і підтвердження в обох полях.",
});

export const TOUR_STEPS = Object.freeze([
  Object.freeze({
    navId: "navHome",
    panelId: "panelHome",
    title: "Крок 1: головна",
    text: "Тут зручний старт: що вчити далі, streak і швидкий доступ до уроку.",
  }),
  Object.freeze({
    navId: "navCourses",
    panelId: "panelCourses",
    title: "Крок 2: курси",
    text: "Обери курс і урок. У повній версії список тягнеться з бекенду.",
  }),
  Object.freeze({
    navId: "navProfile",
    panelId: "panelProfile",
    title: "Крок 3: профіль",
    text: "Мова, сповіщення, вихід. Пароль можна змінити після входу в налаштуваннях.",
  }),
  Object.freeze({
    navId: "navHome",
    panelId: "panelHome",
    title: "Готово!",
    text: "Тур закінчено. Зареєструйся або увійди, щоб зберегти прогрес на хмарі.",
  }),
]);

export const DEMO_DELAY_MS = 600;
export const MIN_PASSWORD_LENGTH = 8;
export const UA_FONT_STORAGE_KEY = "lingvo_landing_ua_font";
export const UA_FONT_MODE_DEFAULT = "default";
export const UA_FONT_MODE_RUTENIA = "rutenia";
export const UA_FONT_HTML_ATTRIBUTE = "data-ua-font";

export function logInfo(message, payload) {
  console.info("[LingvoLanding]", message, payload || {});
}

export function logError(message, error, payload) {
  console.error("[LingvoLanding]", {
    error: error instanceof Error ? error.message : String(error),
    payload: payload || {},
  });
}

export function isValidEmail(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function clampProgressPercent(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

export const els = {
  uaFontSelect: document.getElementById("uaFontSelect"),
  landingStreak: document.getElementById("landingStreak"),
  landingCardSub: document.getElementById("landingCardSub"),
  landingMascotCard: document.getElementById("landingMascotCard"),
  landingProgressLabel: document.getElementById("landingProgressLabel"),
  cheerSquadLive: document.getElementById("cheerSquadLive"),
  openGuestTour: document.getElementById("openGuestTour"),
  openAuthFromHero: document.getElementById("openAuthFromHero"),
  openAuthLogin: document.getElementById("openAuthLogin"),
  openAuthRegister: document.getElementById("openAuthRegister"),
  platformShell: document.getElementById("platformShell"),
  navHome: document.getElementById("navHome"),
  navCourses: document.getElementById("navCourses"),
  navProfile: document.getElementById("navProfile"),
  tourTitle: document.getElementById("tourTitle"),
  tourText: document.getElementById("tourText"),
  tourNext: document.getElementById("tourNext"),
  tourSkip: document.getElementById("tourSkip"),
  authBackdrop: document.getElementById("authBackdrop"),
  authModalTitle: document.getElementById("authModalTitle"),
  authModalSub: document.getElementById("authModalSub"),
  tabLogin: document.getElementById("tabLogin"),
  tabRegister: document.getElementById("tabRegister"),
  authLoginBlock: document.getElementById("authLoginBlock"),
  authRegisterBlock: document.getElementById("authRegisterBlock"),
  authForgotBlock: document.getElementById("authForgotBlock"),
  loginStepBadge: document.getElementById("loginStepBadge"),
  loginStep1: document.getElementById("loginStep1"),
  loginStep2: document.getElementById("loginStep2"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  loginEmailError: document.getElementById("loginEmailError"),
  loginPasswordError: document.getElementById("loginPasswordError"),
  loginToStep2: document.getElementById("loginToStep2"),
  loginBackToStep1: document.getElementById("loginBackToStep1"),
  loginSubmit: document.getElementById("loginSubmit"),
  openForgotFromLogin: document.getElementById("openForgotFromLogin"),
  registerGoogle: document.getElementById("registerGoogle"),
  registerStepBadge: document.getElementById("registerStepBadge"),
  registerStep1: document.getElementById("registerStep1"),
  registerStep2: document.getElementById("registerStep2"),
  registerEmail: document.getElementById("registerEmail"),
  registerPassword: document.getElementById("registerPassword"),
  registerPasswordConfirm: document.getElementById("registerPasswordConfirm"),
  registerEmailError: document.getElementById("registerEmailError"),
  registerPasswordError: document.getElementById("registerPasswordError"),
  registerToStep2: document.getElementById("registerToStep2"),
  registerBackToStep1: document.getElementById("registerBackToStep1"),
  registerSubmit: document.getElementById("registerSubmit"),
  forgotEmail: document.getElementById("forgotEmail"),
  forgotError: document.getElementById("forgotError"),
  forgotSuccess: document.getElementById("forgotSuccess"),
  forgotSubmit: document.getElementById("forgotSubmit"),
  forgotBack: document.getElementById("forgotBack"),
  forgotStepBadge: document.getElementById("forgotStepBadge"),
  closeAuthModal: document.getElementById("closeAuthModal"),
};

export const state = {
  tourIndex: 0,
  authMode: "login",
  loginStep: 1,
  registerStep: 1,
};
