const REMOTE_TEST_ELEMENTS = {
  blocked: document.getElementById("remoteTestBlocked"),
  form: document.getElementById("remoteTestForm"),
  email: document.getElementById("remoteLoginEmail"),
  password: document.getElementById("remoteLoginPassword"),
  loginButton: document.getElementById("remoteLoginButton"),
  output: document.getElementById("remoteTestOutput"),
  backendHint: document.getElementById("remoteBackendHint"),
};
const authClient = window.LingvoAuthClient;

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

function getConfiguredBackendUrl() {
  try {
    return authClient.getPublicBackendUrl();
  } catch (error) {
    logRemoteTestError("remote_test.backend_config.read", error);
    return "";
  }
}

async function verifyRemoteTestInvite() {
  try {
    const params = new URLSearchParams(window.location.search);
    const inviteKey = String(params.get("invite") || "").trim();
    const baseUrl = getConfiguredBackendUrl();
    if (!baseUrl) {
      setRemoteTestOutput("Не налаштовано LINGVO_PUBLIC_BACKEND_URL у lingvoPublicConfig.js.", "warn");
      return false;
    }

    const result = await authClient.request("/auth/remote-test-access", {
      baseUrl,
      method: "POST",
      body: { inviteKey },
      retryOnAuth: false,
    });
    return Boolean(result && result.allowed);
  } catch (error) {
    logRemoteTestError("remote_test.invite.verify", error);
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
    await authClient.login({ email, password }, { baseUrl });
    setRemoteTestOutput("Вхід успішний. Переходимо до платформи…", "ok");
    logRemoteTestInfo("remote_test.login.success", { email });
    window.setTimeout(function () {
      window.location.href = "./project.html";
    }, 600);
  } catch (error) {
    logRemoteTestError("remote_test.login.failed", error, { email });
    const raw = error instanceof Error ? error.message : String(error);
    let hint = raw;
    if (raw === "Failed to fetch" || (typeof TypeError !== "undefined" && error instanceof TypeError)) {
      hint = [
        raw,
        "",
        "Найчастіше: бекенд блокує запити з GitHub Pages (CORS) або Helmet надсилав Cross-Origin-Resource-Policy: same-origin.",
        "На Render у змінній CORS_ALLOWED_ORIGINS додай https://vlad-pm797.github.io (або *).",
        "Перезапусти бекенд після оновлення коду (CORP cross-origin у app.ts).",
      ].join("\n");
    }
    setRemoteTestOutput(`Помилка входу:\n${hint}`, "warn");
  }
}

async function bootstrapRemoteTest() {
  try {
    const isAllowed = await verifyRemoteTestInvite();
    if (!isAllowed) {
      if (REMOTE_TEST_ELEMENTS.form) {
        REMOTE_TEST_ELEMENTS.form.hidden = true;
      }
      if (REMOTE_TEST_ELEMENTS.blocked) {
        REMOTE_TEST_ELEMENTS.blocked.hidden = false;
      }
      setRemoteTestOutput("Доступ до тестового входу обмежено.", "warn");
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

void bootstrapRemoteTest();
