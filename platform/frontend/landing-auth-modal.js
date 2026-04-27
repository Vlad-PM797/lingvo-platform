import { AUTH_COPY, DEMO_DELAY_MS, els, isValidEmail, logError, logInfo, MIN_PASSWORD_LENGTH, state } from "./landing-shared.js";

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

export function initLandingAuthModal() {
  els.openAuthFromHero.addEventListener("click", () => showAuthModal("login"));
  els.openAuthLogin.addEventListener("click", () => showAuthModal("login"));
  els.openAuthRegister.addEventListener("click", () => showAuthModal("register"));
  els.tabLogin.addEventListener("click", () => showAuthModal("login"));
  els.tabRegister.addEventListener("click", () => showAuthModal("register"));
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
}
