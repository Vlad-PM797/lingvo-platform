const elements = {
  baseUrl: document.getElementById("baseUrl"),
  registerEmail: document.getElementById("registerEmail"),
  registerPassword: document.getElementById("registerPassword"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  registerButton: document.getElementById("registerButton"),
  loginButton: document.getElementById("loginButton"),
  output: document.getElementById("output"),
};

const STORAGE_KEYS = Object.freeze({
  backendUrl: "lingvo_backend_url",
  accessToken: "lingvo_access_token",
  refreshToken: "lingvo_refresh_token",
});

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

async function handleRegister() {
  try {
    const email = String(elements.registerEmail.value || "").trim();
    const password = String(elements.registerPassword.value || "");
    if (!email || password.length < 8) {
      throw new Error("Вкажи валідний email і пароль від 8 символів.");
    }

    const result = await requestJson("/auth/register", { email, password });
    setOutput(`Користувач створений:\n${JSON.stringify(result, null, 2)}`, "ok");
  } catch (error) {
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

    const result = await requestJson("/auth/login", { email, password });
    if (result.accessToken) {
      window.localStorage.setItem(STORAGE_KEYS.accessToken, result.accessToken);
    }
    if (result.refreshToken) {
      window.localStorage.setItem(STORAGE_KEYS.refreshToken, result.refreshToken);
    }
    setOutput(`Вхід успішний. Токени збережено локально.\n${JSON.stringify(result, null, 2)}`, "ok");
  } catch (error) {
    setOutput(`Помилка входу:\n${error instanceof Error ? error.message : String(error)}`, "warn");
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
}

bootstrap();
