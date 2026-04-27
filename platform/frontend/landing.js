    const AUTH_COPY = Object.freeze({
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

    const TOUR_STEPS = Object.freeze([
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

    const DEMO_DELAY_MS = 600;
    const MIN_PASSWORD_LENGTH = 8;

    const UA_FONT_STORAGE_KEY = "lingvo_landing_ua_font";
    const UA_FONT_MODE_DEFAULT = "default";
    const UA_FONT_MODE_RUTENIA = "rutenia";
    const UA_FONT_HTML_ATTRIBUTE = "data-ua-font";
    const LINGVO_BACKEND_URL_KEY = "lingvo_backend_url";
    const LINGVO_ACCESS_TOKEN_KEY = "lingvo_access_token";

    function logInfo(message, payload) {
      console.info("[LingvoLanding]", message, payload || {});
    }

    function logError(message, error, payload) {
      console.error("[LingvoLanding]", message, {
        error: error instanceof Error ? error.message : String(error),
        payload: payload || {},
      });
    }

    function isValidEmail(value) {
      const trimmed = String(value || "").trim();
      if (!trimmed) {
        return false;
      }
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    }

    const els = {
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

    function normalizeLandingBaseUrl(rawValue) {
      return String(rawValue || "").trim().replace(/\/+$/, "");
    }

    function clampProgressPercent(value) {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        return 0;
      }
      return Math.max(0, Math.min(100, Math.round(numericValue)));
    }

    function applyLandingProgressDemo() {
      try {
        if (els.landingMascotCard) {
          els.landingMascotCard.style.setProperty("--landing-progress-pct", "62%");
          els.landingMascotCard.setAttribute("aria-label", "Приклад прогресу");
        }
        if (els.landingCardSub) {
          els.landingCardSub.textContent = "Сьогодні: урок 3 · Привітання";
        }
        if (els.landingProgressLabel) {
          els.landingProgressLabel.textContent = "Прогрес уроку";
        }
        if (els.landingStreak) {
          els.landingStreak.textContent = "🔥 7 днів поспіль";
        }
        if (els.cheerSquadLive) {
          els.cheerSquadLive.textContent = "";
          els.cheerSquadLive.hidden = true;
        }
      } catch (error) {
        logError("landing.progress.demo.apply.failed", error, {});
      }
    }

    function applyLandingProgressFromApi(progressBody) {
      try {
        const totals = progressBody.totals || {};
        const spotlight = progressBody.spotlightLesson || null;
        const streakDays = Number(progressBody.streakDays) || 0;
        const attempts = Number(totals.attemptsCount) || 0;
        const completed = Number(totals.completedLessonsCount) || 0;
        const accuracyTotal = clampProgressPercent(totals.accuracyPercent);
        const barSource = spotlight ? spotlight.accuracyPercent : totals.accuracyPercent;
        const barPct = attempts === 0 ? 12 : Math.max(10, clampProgressPercent(barSource));

        if (els.landingMascotCard) {
          els.landingMascotCard.style.setProperty("--landing-progress-pct", `${barPct}%`);
          els.landingMascotCard.setAttribute("aria-label", "Твій прогрес з бекенду");
        }
        if (els.landingProgressLabel) {
          els.landingProgressLabel.textContent =
            attempts === 0 ? "Почни перші спроби" : spotlight ? "Точність останнього уроку" : "Загальна точність";
        }
        if (els.landingCardSub) {
          if (spotlight) {
            const coursePart = spotlight.courseTitle ? `${spotlight.courseTitle} · ` : "";
            const doneSuffix = spotlight.completed ? " ✓" : "";
            els.landingCardSub.textContent = `Остання активність: ${coursePart}урок ${spotlight.ordinal} · ${spotlight.title}${doneSuffix}`;
          } else if (attempts > 0) {
            els.landingCardSub.textContent = `Усього спроб: ${attempts} · точність ${accuracyTotal}% · завершено уроків: ${completed}`;
          } else {
            els.landingCardSub.textContent = "Ще немає спроб — зайди в тренажер або портал і почни урок.";
          }
        }
        if (els.landingStreak) {
          if (streakDays > 0) {
            els.landingStreak.textContent = `🔥 ${streakDays} дн. поспіль за завершеннями уроків`;
          } else if (attempts > 0) {
            els.landingStreak.textContent = `📚 ${completed} ур. · ${attempts} спроб`;
          } else {
            els.landingStreak.textContent = "🌱 Почни сьогодні — streak підвищиться";
          }
        }
        if (els.cheerSquadLive) {
          els.cheerSquadLive.textContent =
            attempts === 0
              ? "Після перших відповідей у тренажері ми підтягнемо твої цифри сюди автоматично."
              : `Звірята кажуть: уже ${attempts} спроб, точність ${accuracyTotal}% — так тримати!`;
          els.cheerSquadLive.hidden = false;
        }
      } catch (error) {
        logError("landing.progress.api.apply.failed", error, {});
        applyLandingProgressDemo();
      }
    }

    async function syncLandingProgressWithBackend() {
      const baseUrl = normalizeLandingBaseUrl(window.localStorage.getItem(LINGVO_BACKEND_URL_KEY));
      const accessToken = window.localStorage.getItem(LINGVO_ACCESS_TOKEN_KEY);
      if (!baseUrl || !accessToken) {
        applyLandingProgressDemo();
        return;
      }
      try {
        const response = await fetch(`${baseUrl}/learning/progress/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        const responseText = await response.text();
        let responseBody = {};
        try {
          responseBody = responseText ? JSON.parse(responseText) : {};
        } catch {
          responseBody = {};
        }
        if (!response.ok) {
          logError("landing.progress.http.error", new Error(`HTTP ${response.status}`), { status: response.status });
          applyLandingProgressDemo();
          if (response.status === 401 && els.cheerSquadLive) {
            els.cheerSquadLive.textContent =
              "Токен прострочений або недійсний — зайди знову через портал, і прогрес з’явиться.";
            els.cheerSquadLive.hidden = false;
          }
          return;
        }
        applyLandingProgressFromApi(responseBody);
      } catch (error) {
        logError("landing.progress.sync.failed", error, {});
        applyLandingProgressDemo();
      }
    }

    function applyUaFontMode(modeValue) {
      try {
        if (modeValue === UA_FONT_MODE_RUTENIA) {
          document.documentElement.setAttribute(UA_FONT_HTML_ATTRIBUTE, UA_FONT_MODE_RUTENIA);
        } else {
          document.documentElement.removeAttribute(UA_FONT_HTML_ATTRIBUTE);
        }
        if (els.uaFontSelect) {
          els.uaFontSelect.value = modeValue === UA_FONT_MODE_RUTENIA ? UA_FONT_MODE_RUTENIA : UA_FONT_MODE_DEFAULT;
        }
        logInfo("ua_font.apply", { mode: modeValue });
      } catch (error) {
        logError("ua_font.apply.failed", error, { modeValue });
      }
    }

    function initUaFontFromStorage() {
      try {
        const saved = window.localStorage.getItem(UA_FONT_STORAGE_KEY);
        const mode = saved === UA_FONT_MODE_RUTENIA ? UA_FONT_MODE_RUTENIA : UA_FONT_MODE_DEFAULT;
        applyUaFontMode(mode);
      } catch (error) {
        logError("ua_font.init.failed", error, {});
        applyUaFontMode(UA_FONT_MODE_DEFAULT);
      }
    }

    function handleUaFontChange() {
      try {
        const value = String(els.uaFontSelect.value || UA_FONT_MODE_DEFAULT);
        window.localStorage.setItem(UA_FONT_STORAGE_KEY, value);
        applyUaFontMode(value);
      } catch (error) {
        logError("ua_font.change.failed", error, {});
      }
    }

    const state = {
      tourIndex: 0,
      authMode: "login",
      loginStep: 1,
      registerStep: 1,
    };

    function clearTourHighlights() {
      [els.navHome, els.navCourses, els.navProfile].forEach((node) => {
        node.classList.remove("is-tour-target");
      });
    }

    function showPanel(panelId) {
      document.querySelectorAll(".platform-panel").forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === panelId);
      });
    }

    function bindNavClicks() {
      document.querySelectorAll(".platform-nav button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const panelId = btn.getAttribute("data-panel");
          if (!panelId) {
            return;
          }
          showPanel(panelId);
        });
      });
    }

    function renderTourStep() {
      const step = TOUR_STEPS[state.tourIndex];
      if (!step) {
        return;
      }
      clearTourHighlights();
      const navBtn = document.getElementById(step.navId);
      if (navBtn) {
        navBtn.classList.add("is-tour-target");
      }
      showPanel(step.panelId);
      els.tourTitle.textContent = step.title;
      els.tourText.textContent = step.text;
      els.tourNext.textContent = state.tourIndex === TOUR_STEPS.length - 1 ? "Завершити" : "Далі";
    }

    function openGuestTour() {
      try {
        els.platformShell.hidden = false;
        els.platformShell.classList.add("is-open");
        state.tourIndex = 0;
        renderTourStep();
        logInfo("guest_tour.open", { step: state.tourIndex });
      } catch (error) {
        logError("guest_tour.open.failed", error, {});
      }
    }

    function closeGuestTour() {
      try {
        els.platformShell.classList.remove("is-open");
        els.platformShell.hidden = true;
        clearTourHighlights();
        logInfo("guest_tour.close", {});
      } catch (error) {
        logError("guest_tour.close.failed", error, {});
      }
    }

    function tourNext() {
      try {
        if (state.tourIndex >= TOUR_STEPS.length - 1) {
          closeGuestTour();
          return;
        }
        state.tourIndex += 1;
        renderTourStep();
        logInfo("guest_tour.step", { index: state.tourIndex });
      } catch (error) {
        logError("guest_tour.step.failed", error, {});
      }
    }

    function resetLoginUi() {
      state.loginStep = 1;
      els.loginStep1.hidden = false;
      els.loginStep2.hidden = true;
      els.loginStepBadge.textContent = AUTH_COPY.stepAccount;
      els.loginEmailError.textContent = "";
      els.loginPasswordError.textContent = "";
    }

    function resetRegisterUi() {
      state.registerStep = 1;
      els.registerStep1.hidden = false;
      els.registerStep2.hidden = true;
      els.registerStepBadge.textContent = AUTH_COPY.stepAccount;
      els.registerEmailError.textContent = "";
      els.registerPasswordError.textContent = "";
    }

    function resetForgotUi() {
      els.forgotError.textContent = "";
      els.forgotSuccess.hidden = true;
      els.forgotSuccess.textContent = "";
    }

    function showAuthModal(mode) {
      try {
        state.authMode = mode;
        els.authBackdrop.hidden = false;
        els.authBackdrop.classList.add("is-open");
        els.authForgotBlock.hidden = true;
        els.authLoginBlock.hidden = mode !== "login";
        els.authRegisterBlock.hidden = mode !== "register";
        els.tabLogin.classList.toggle("is-active", mode === "login");
        els.tabRegister.classList.toggle("is-active", mode === "register");
        els.tabLogin.setAttribute("aria-selected", mode === "login" ? "true" : "false");
        els.tabRegister.setAttribute("aria-selected", mode === "register" ? "true" : "false");

        if (mode === "login") {
          els.authModalTitle.textContent = AUTH_COPY.loginTitle;
          els.authModalSub.textContent = AUTH_COPY.loginSub;
          resetLoginUi();
        } else {
          els.authModalTitle.textContent = AUTH_COPY.registerTitle;
          els.authModalSub.textContent = AUTH_COPY.registerSub;
          resetRegisterUi();
        }
        resetForgotUi();
        logInfo("auth.modal.open", { mode });
      } catch (error) {
        logError("auth.modal.open.failed", error, { mode });
      }
    }

    function closeAuthModal() {
      try {
        els.authBackdrop.classList.remove("is-open");
        els.authBackdrop.hidden = true;
        els.authForgotBlock.hidden = true;
        els.authLoginBlock.hidden = false;
        resetForgotUi();
        logInfo("auth.modal.close", {});
      } catch (error) {
        logError("auth.modal.close.failed", error, {});
      }
    }

    function showForgotPassword() {
      try {
        els.authForgotBlock.hidden = false;
        els.authLoginBlock.hidden = true;
        els.authRegisterBlock.hidden = true;
        els.authModalTitle.textContent = AUTH_COPY.forgotTitle;
        els.authModalSub.textContent = AUTH_COPY.forgotSub;
        resetForgotUi();
        logInfo("auth.forgot.show", {});
      } catch (error) {
        logError("auth.forgot.show.failed", error, {});
      }
    }

    function loginGoStep2() {
      try {
        const email = els.loginEmail.value.trim();
        if (!isValidEmail(email)) {
          els.loginEmailError.textContent = AUTH_COPY.emailInvalid;
          return;
        }
        els.loginEmailError.textContent = "";
        state.loginStep = 2;
        els.loginStep1.hidden = true;
        els.loginStep2.hidden = false;
        els.loginStepBadge.textContent = AUTH_COPY.stepPasswordLogin;
        els.loginPassword.focus();
        logInfo("auth.login.step2", { email });
      } catch (error) {
        logError("auth.login.step2.failed", error, {});
      }
    }

    function loginBackStep1() {
      state.loginStep = 1;
      els.loginStep1.hidden = false;
      els.loginStep2.hidden = true;
      els.loginStepBadge.textContent = AUTH_COPY.stepAccount;
      els.loginPasswordError.textContent = "";
    }

    function submitLogin() {
      try {
        const password = els.loginPassword.value;
        if (!password) {
          els.loginPasswordError.textContent = AUTH_COPY.loginPasswordEmpty;
          return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          els.loginPasswordError.textContent = AUTH_COPY.loginPasswordShort;
          return;
        }
        els.loginPasswordError.textContent = "";
        window.alert(AUTH_COPY.loginDemo);
        closeAuthModal();
        logInfo("auth.login.submit.demo", {});
      } catch (error) {
        logError("auth.login.submit.failed", error, {});
      }
    }

    function registerGoStep2() {
      try {
        const email = els.registerEmail.value.trim();
        if (!isValidEmail(email)) {
          els.registerEmailError.textContent = AUTH_COPY.emailInvalid;
          return;
        }
        els.registerEmailError.textContent = "";
        state.registerStep = 2;
        els.registerStep1.hidden = true;
        els.registerStep2.hidden = false;
        els.registerStepBadge.textContent = AUTH_COPY.stepPasswordRegister;
        els.registerPassword.focus();
        logInfo("auth.register.step2", { email });
      } catch (error) {
        logError("auth.register.step2.failed", error, {});
      }
    }

    function registerBackStep1() {
      state.registerStep = 1;
      els.registerStep1.hidden = false;
      els.registerStep2.hidden = true;
      els.registerStepBadge.textContent = AUTH_COPY.stepAccount;
      els.registerPasswordError.textContent = "";
    }

    function submitRegister() {
      try {
        const pass = els.registerPassword.value;
        const pass2 = els.registerPasswordConfirm.value;
        if (!pass || !pass2) {
          els.registerPasswordError.textContent = AUTH_COPY.registerPasswordEmpty;
          return;
        }
        if (pass.length < MIN_PASSWORD_LENGTH) {
          els.registerPasswordError.textContent = AUTH_COPY.passwordShort;
          return;
        }
        if (pass !== pass2) {
          els.registerPasswordError.textContent = AUTH_COPY.passwordMismatch;
          return;
        }
        els.registerPasswordError.textContent = "";
        window.alert(AUTH_COPY.registerDemo);
        closeAuthModal();
        logInfo("auth.register.submit.demo", {});
      } catch (error) {
        logError("auth.register.submit.failed", error, {});
      }
    }

    function simulatePasswordResetEmail() {
      return new Promise((resolve) => {
        window.setTimeout(resolve, DEMO_DELAY_MS);
      });
    }

    async function submitForgotPassword() {
      try {
        const email = els.forgotEmail.value.trim();
        if (!isValidEmail(email)) {
          els.forgotError.textContent = AUTH_COPY.emailInvalid;
          return;
        }
        els.forgotError.textContent = "";
        await simulatePasswordResetEmail();
        els.forgotSuccess.textContent = AUTH_COPY.forgotSuccess;
        els.forgotSuccess.hidden = false;
        logInfo("auth.forgot.submit.demo", { email });
      } catch (error) {
        logError("auth.forgot.submit.failed", error, {});
        els.forgotError.textContent = "Не вдалося надіслати лист. Спробуй ще раз.";
      }
    }

    function handleGoogleRegister() {
      try {
        window.alert(AUTH_COPY.googleDemo);
        logInfo("auth.register.google.click", {});
      } catch (error) {
        logError("auth.register.google.click.failed", error, {});
      }
    }

    els.openGuestTour.addEventListener("click", openGuestTour);
    els.tourNext.addEventListener("click", tourNext);
    els.tourSkip.addEventListener("click", closeGuestTour);
    els.openAuthFromHero.addEventListener("click", () => showAuthModal("login"));
    els.openAuthLogin.addEventListener("click", () => showAuthModal("login"));
    els.openAuthRegister.addEventListener("click", () => showAuthModal("register"));

    els.tabLogin.addEventListener("click", () => {
      showAuthModal("login");
    });
    els.tabRegister.addEventListener("click", () => {
      showAuthModal("register");
    });

    els.closeAuthModal.addEventListener("click", closeAuthModal);
    els.authBackdrop.addEventListener("click", (event) => {
      if (event.target === els.authBackdrop) {
        closeAuthModal();
      }
    });

    els.loginToStep2.addEventListener("click", loginGoStep2);
    els.loginBackToStep1.addEventListener("click", loginBackStep1);
    els.loginSubmit.addEventListener("click", submitLogin);
    els.openForgotFromLogin.addEventListener("click", showForgotPassword);
    els.forgotBack.addEventListener("click", () => {
      els.authForgotBlock.hidden = true;
      els.authLoginBlock.hidden = false;
      els.authModalTitle.textContent = AUTH_COPY.loginTitle;
      els.authModalSub.textContent = AUTH_COPY.loginSub;
      resetLoginUi();
    });
    els.forgotSubmit.addEventListener("click", () => {
      void submitForgotPassword();
    });

    els.registerGoogle.addEventListener("click", handleGoogleRegister);
    els.registerToStep2.addEventListener("click", registerGoStep2);
    els.registerBackToStep1.addEventListener("click", registerBackStep1);
    els.registerSubmit.addEventListener("click", submitRegister);

    bindNavClicks();
    initUaFontFromStorage();
    if (els.uaFontSelect) {
      els.uaFontSelect.addEventListener("change", handleUaFontChange);
    }
    window.addEventListener("storage", (event) => {
      if (event.key === LINGVO_ACCESS_TOKEN_KEY || event.key === LINGVO_BACKEND_URL_KEY) {
        void syncLandingProgressWithBackend();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void syncLandingProgressWithBackend();
      }
    });
    void syncLandingProgressWithBackend();
    logInfo("landing.boot", { tourSteps: TOUR_STEPS.length });
