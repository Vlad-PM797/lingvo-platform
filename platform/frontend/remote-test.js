const REMOTE_TEST_STORAGE_KEYS = Object.freeze({
  backendUrl: "lingvo_backend_url",
  accessToken: "lingvo_access_token",
  refreshToken: "lingvo_refresh_token",
});

const REMOTE_TEST_ELEMENTS = {
  blocked: document.getElementById("remoteTestBlocked"),
  form: document.getElementById("remoteTestForm"),
  email: document.getElementById("remoteLoginEmail"),
  password: document.getElementById("remoteLoginPassword"),
  loginButton: document.getElementById("remoteLoginButton"),
  output: document.getElementById("remoteTestOutput"),
  backendHint: document.getElementById("remoteBackendHint"),
};

function logRemoteTestInfo(operationName, payload) {
  try {
    console.info(`[INFO] ${operationName}`, payload || {});
  } catch (error) {
    console.error("[ERROR] remote_test.log", error);
  }
}

function logRemoteTestError(operationName, error, payload) {
  try {
    console.error(`[ERROR] ${operationName}`, {
      message: error instanceof Error ? error.message : String(error),
      payload: payload || {},
    });
  } catch (logError) {
    console.error("[ERROR] remote_test.log_failed", logError);
  }
}

function normalizeBaseUrl(rawValue) {
  return String(rawValue || "").trim().replace(/\/+$/, "");
}

function getConfiguredBackendUrl() {
  try {
    return normalizeBaseUrl(window.LINGVO_PUBLIC_BACKEND_URL);
  } catch (error) {
    logRemoteTestError("remote_test.backend_config.read", error);
    return "";
  }
}

function isInviteValid() {
  try {
    const required = String(window.LINGVO_REMOTE_TEST_INVITE_KEY || "").trim();
    if (!required) {
      return true;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("invite") === required;
  } catch (error) {
    logRemoteTestError("remote_test.invite.check", error);
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
    logRemoteTestError("remote_test.output.set", error);
  }
}

async function performRemoteLogin() {
  const baseUrl = getConfiguredBackendUrl();
  if (!baseUrl) {
    setRemoteTestOutput("Не налаштовано LINGVO_PUBLIC_BACKEND_URL у lingvoPublicConfig.js.", "warn");
    return;
  }

  const email = String(REMOTE_TEST_ELEMENTS.email?.value || "").trim();
  const password = String(REMOTE_TEST_ELEMENTS.password?.value || "");
  if (!email || password.length < 8) {
    setRemoteTestOutput("Вкажи email і пароль (мінімум 8 символів).", "warn");
    return;
  }

  try {
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
    setRemoteTestOutput("Вхід успішний. Переходимо до платформи…", "ok");
    logRemoteTestInfo("remote_test.login.success", { email });
    window.setTimeout(function () {
      window.location.href = "./project.html";
    }, 600);
  } catch (error) {
    logRemoteTestError("remote_test.login.failed", error, { email });
    setRemoteTestOutput(`Помилка входу:\n${error instanceof Error ? error.message : String(error)}`, "warn");
  }
}

function bootstrapRemoteTest() {
  try {
    if (!isInviteValid()) {
      if (REMOTE_TEST_ELEMENTS.form) {
        REMOTE_TEST_ELEMENTS.form.hidden = true;
      }
      if (REMOTE_TEST_ELEMENTS.blocked) {
        REMOTE_TEST_ELEMENTS.blocked.hidden = false;
      }
      return;
    }

    const baseUrl = getConfiguredBackendUrl();
    if (REMOTE_TEST_ELEMENTS.backendHint) {
      REMOTE_TEST_ELEMENTS.backendHint.textContent = baseUrl
        ? `Сервер: ${baseUrl}`
        : "Увага: у lingvoPublicConfig.js не задано LINGVO_PUBLIC_BACKEND_URL.";
    }

    REMOTE_TEST_ELEMENTS.loginButton?.addEventListener("click", function () {
      void performRemoteLogin();
    });
    REMOTE_TEST_ELEMENTS.password?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        void performRemoteLogin();
      }
    });
  } catch (error) {
    logRemoteTestError("remote_test.bootstrap", error);
  }
}

bootstrapRemoteTest();
