<<<<<<< HEAD
=======
const REMOTE_TEST_STORAGE_KEYS = Object.freeze({
  backendUrl: "lingvo_backend_url",
  accessToken: "lingvo_access_token",
  refreshToken: "lingvo_refresh_token",
  targetLang: "lingvo_target_lang",
});

>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
const REMOTE_TEST_ELEMENTS = {
  blocked: document.getElementById("remoteTestBlocked"),
  form: document.getElementById("remoteTestForm"),
  email: document.getElementById("remoteLoginEmail"),
  password: document.getElementById("remoteLoginPassword"),
  targetLangSelect: document.getElementById("remoteTargetLangSelect"),
  loginButton: document.getElementById("remoteLoginButton"),
  output: document.getElementById("remoteTestOutput"),
  backendHint: document.getElementById("remoteBackendHint"),
};

<<<<<<< HEAD
const authClient = window.LingvoAuthClient;
const sharedUi = window.LingvoFrontendShared;
const logger = sharedUi.createConsoleLogger("remote_test");
=======
const TARGET_LANG = Object.freeze({
  english: "en",
  italian: "it",
});

function logRemoteTestInfo(operationName, payload) {
  try {
    console.info(`[INFO] ${operationName}`, payload || {});
  } catch (error) {
    console.error("[ERROR] remote_test.log", error);
  }
}
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca

const REMOTE_TEST_MESSAGES = Object.freeze({
  backendMissing: "РќРµ РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ LINGVO_PUBLIC_BACKEND_URL Сѓ lingvoPublicConfig.js.",
  accessDenied: "Р”РѕСЃС‚СѓРї РґРѕ С‚РµСЃС‚РѕРІРѕРіРѕ РІС…РѕРґСѓ РѕР±РјРµР¶РµРЅРѕ.",
  loginSuccess: "Р’С…С–Рґ СѓСЃРїС–С€РЅРёР№. РџРµСЂРµС…РѕРґРёРјРѕ РґРѕ РїР»Р°С‚С„РѕСЂРјРёвЂ¦",
  loginHint: "Р’РєР°Р¶Рё email С– РїР°СЂРѕР»СЊ (РјС–РЅС–РјСѓРј 8 СЃРёРјРІРѕР»С–РІ).",
});

function getConfiguredBackendUrl() {
  try {
    return authClient.getPublicBackendUrl();
  } catch (error) {
    logger.error("backend_config.read", error);
    return "";
  }
}

function getBaseUrlOrWarn() {
  const baseUrl = getConfiguredBackendUrl();
  if (!baseUrl) {
    setRemoteTestOutput(REMOTE_TEST_MESSAGES.backendMissing, "warn");
    return "";
  }
  return baseUrl;
}

function redirectToProjectPage() {
  window.location.href = "./project.html";
}

async function verifyRemoteTestInvite(baseUrl) {
  try {
    const params = new URLSearchParams(window.location.search);
    const inviteKey = String(params.get("invite") || "").trim();
    const result = await authClient.request("/auth/remote-test-access", {
      baseUrl,
      method: "POST",
      body: { inviteKey },
      retryOnAuth: false,
    });
    return Boolean(result && result.allowed);
  } catch (error) {
    logger.error("invite.verify", error);
    return false;
  }
}

function setRemoteTestOutput(text, mode) {
  try {
    const node = REMOTE_TEST_ELEMENTS.output;
    if (!node) {
      return;
    }
    node.className = mode === "ok" ? "ok" : mode === "warn" ? "warn" : "";
    node.textContent = text;
  } catch (error) {
    logger.error("output.set", error);
  }
}

<<<<<<< HEAD
async function performRemoteLogin(baseUrl) {
=======
function getSelectedTargetLang() {
  const raw = String(REMOTE_TEST_ELEMENTS.targetLangSelect?.value || "").trim().toLowerCase();
  return raw === TARGET_LANG.italian ? TARGET_LANG.italian : TARGET_LANG.english;
}

async function performRemoteLogin() {
  const baseUrl = getConfiguredBackendUrl();
  if (!baseUrl) {
    setRemoteTestOutput("Не налаштовано LINGVO_PUBLIC_BACKEND_URL у lingvoPublicConfig.js.", "warn");
    return;
  }

>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
  const email = String(REMOTE_TEST_ELEMENTS.email?.value || "").trim();
  const password = String(REMOTE_TEST_ELEMENTS.password?.value || "");
  if (!email || password.length < 8) {
    setRemoteTestOutput(REMOTE_TEST_MESSAGES.loginHint, "warn");
    return;
  }

  try {
<<<<<<< HEAD
    logger.info("login.attempt", { email });
    await authClient.login({ email, password }, { baseUrl });
    setRemoteTestOutput(REMOTE_TEST_MESSAGES.loginSuccess, "ok");
    logger.info("login.success", { email });
    window.setTimeout(() => {
      redirectToProjectPage();
=======
    logRemoteTestInfo("remote_test.login.attempt", { email });
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
    if (data.accessToken) {
      window.localStorage.setItem(REMOTE_TEST_STORAGE_KEYS.accessToken, data.accessToken);
    }
    if (data.refreshToken) {
      window.localStorage.setItem(REMOTE_TEST_STORAGE_KEYS.refreshToken, data.refreshToken);
    }
    window.localStorage.setItem(REMOTE_TEST_STORAGE_KEYS.backendUrl, baseUrl);
    window.localStorage.setItem(REMOTE_TEST_STORAGE_KEYS.targetLang, getSelectedTargetLang());
    setRemoteTestOutput("Вхід успішний. Переходимо до платформи…", "ok");
    logRemoteTestInfo("remote_test.login.success", { email });
    window.setTimeout(function () {
      window.location.href = "./project.html";
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
    }, 600);
  } catch (error) {
    logger.error("login.failed", error, { email });
    const raw = error instanceof Error ? error.message : String(error);
    let hint = raw;
    if (raw === "Failed to fetch" || (typeof TypeError !== "undefined" && error instanceof TypeError)) {
      hint = [
        raw,
        "",
        "РќР°Р№С‡Р°СЃС‚С–С€Рµ: Р±РµРєРµРЅРґ Р±Р»РѕРєСѓС” Р·Р°РїРёС‚Рё Р· GitHub Pages (CORS) Р°Р±Рѕ Helmet РЅР°РґСЃРёР»Р°РІ Cross-Origin-Resource-Policy: same-origin.",
        "РќР° Render Сѓ Р·РјС–РЅРЅС–Р№ CORS_ALLOWED_ORIGINS РґРѕРґР°Р№ https://vlad-pm797.github.io (Р°Р±Рѕ *).",
        "РџРµСЂРµР·Р°РїСѓСЃС‚Рё Р±РµРєРµРЅРґ РїС–СЃР»СЏ РѕРЅРѕРІР»РµРЅРЅСЏ РєРѕРґСѓ (CORP cross-origin Сѓ app.ts).",
      ].join("\n");
    }
    setRemoteTestOutput(`РџРѕРјРёР»РєР° РІС…РѕРґСѓ:\n${hint}`, "warn");
  }
}

async function bootstrapRemoteTest() {
  try {
    const baseUrl = getBaseUrlOrWarn();
    if (!baseUrl) {
      return;
    }

    const isAllowed = await verifyRemoteTestInvite(baseUrl);
    if (!isAllowed) {
      if (REMOTE_TEST_ELEMENTS.form) {
        REMOTE_TEST_ELEMENTS.form.hidden = true;
      }
      if (REMOTE_TEST_ELEMENTS.blocked) {
        REMOTE_TEST_ELEMENTS.blocked.hidden = false;
      }
      setRemoteTestOutput(REMOTE_TEST_MESSAGES.accessDenied, "warn");
      return;
    }

    const accessToken = await authClient.restoreSession({ baseUrl });
    if (accessToken) {
      logger.info("session.restore.success");
      redirectToProjectPage();
      return;
    }

<<<<<<< HEAD
    if (REMOTE_TEST_ELEMENTS.backendHint) {
      REMOTE_TEST_ELEMENTS.backendHint.textContent = `РЎРµСЂРІРµСЂ: ${baseUrl}`;
    }

    REMOTE_TEST_ELEMENTS.loginButton?.addEventListener("click", () => {
      void performRemoteLogin(baseUrl);
=======
    const savedTargetLang = String(window.localStorage.getItem(REMOTE_TEST_STORAGE_KEYS.targetLang) || "")
      .trim()
      .toLowerCase();
    if (REMOTE_TEST_ELEMENTS.targetLangSelect) {
      REMOTE_TEST_ELEMENTS.targetLangSelect.value =
        savedTargetLang === TARGET_LANG.italian ? TARGET_LANG.italian : TARGET_LANG.english;
    }
    REMOTE_TEST_ELEMENTS.targetLangSelect?.addEventListener("change", function () {
      window.localStorage.setItem(REMOTE_TEST_STORAGE_KEYS.targetLang, getSelectedTargetLang());
    });

    REMOTE_TEST_ELEMENTS.loginButton?.addEventListener("click", function () {
      void performRemoteLogin();
>>>>>>> dcdd6c04796379ae97ec4794a72ccd547b201aca
    });
    REMOTE_TEST_ELEMENTS.password?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void performRemoteLogin(baseUrl);
      }
    });
  } catch (error) {
    logger.error("bootstrap", error);
  }
}

void bootstrapRemoteTest();
