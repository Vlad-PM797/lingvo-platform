(function () {
  "use strict";

  const STORAGE_KEYS = Object.freeze({
    backendUrl: "lingvo_backend_url",
    accessToken: "lingvo_access_token",
  });

  const DEFAULT_MESSAGES = Object.freeze({
    missingBackendUrl: "Вкажи Backend URL або задай LINGVO_PUBLIC_BACKEND_URL у lingvoPublicConfig.js.",
    missingAccessToken: "Сесія відсутня. Увійди ще раз.",
  });

  function normalizeBaseUrl(rawValue) {
    return String(rawValue || "").trim().replace(/\/+$/, "");
  }

  function getPublicBackendUrl() {
    try {
      return normalizeBaseUrl(window.LINGVO_PUBLIC_BACKEND_URL);
    } catch {
      return "";
    }
  }

  function getStoredBackendUrl() {
    try {
      return normalizeBaseUrl(window.localStorage.getItem(STORAGE_KEYS.backendUrl));
    } catch {
      return "";
    }
  }

  function resolveBackendUrl(options) {
    const preferredInput = normalizeBaseUrl(options && options.inputValue);
    if (preferredInput) {
      return preferredInput;
    }
    const stored = getStoredBackendUrl();
    if (stored) {
      return stored;
    }
    return getPublicBackendUrl();
  }

  function getBaseUrlOrThrow(options) {
    const value = resolveBackendUrl(options);
    if (!value) {
      throw new Error(DEFAULT_MESSAGES.missingBackendUrl);
    }
    return value;
  }

  function setBackendUrl(rawValue) {
    const normalized = normalizeBaseUrl(rawValue);
    if (!normalized) {
      window.localStorage.removeItem(STORAGE_KEYS.backendUrl);
      return "";
    }
    window.localStorage.setItem(STORAGE_KEYS.backendUrl, normalized);
    return normalized;
  }

  function getAccessToken() {
    return String(window.sessionStorage.getItem(STORAGE_KEYS.accessToken) || "");
  }

  function hasAccessToken() {
    return Boolean(getAccessToken());
  }

  function setTokens(tokens) {
    if (tokens && typeof tokens.accessToken === "string" && tokens.accessToken) {
      window.sessionStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    }
  }

  function clearSession() {
    window.sessionStorage.removeItem(STORAGE_KEYS.accessToken);
    window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    window.localStorage.removeItem("lingvo_refresh_token");
  }

  async function parseResponse(response) {
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    return data;
  }

  function toHttpError(response, data) {
    return new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  async function refreshTokens(options) {
    const baseUrl = getBaseUrlOrThrow({ inputValue: options && options.baseUrl });
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      clearSession();
      throw toHttpError(response, data);
    }

    setTokens(data);
    return data;
  }

  async function request(path, options) {
    const requestOptions = options || {};
    const baseUrl = getBaseUrlOrThrow({ inputValue: requestOptions.baseUrl });
    const method = requestOptions.method || "GET";
    const headers = Object.assign({}, requestOptions.headers || {});
    const shouldUseAuth = Boolean(requestOptions.auth);

    if (shouldUseAuth) {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error(DEFAULT_MESSAGES.missingAccessToken);
      }
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let body;
    if (requestOptions.body !== undefined && requestOptions.body !== null) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = headers["Content-Type"] === "application/json"
        ? JSON.stringify(requestOptions.body)
        : requestOptions.body;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body,
      credentials: "include",
    });

    let data = await parseResponse(response);
    if (response.status === 401 && shouldUseAuth && requestOptions.retryOnAuth !== false) {
      await refreshTokens({ baseUrl });
      const nextAccessToken = getAccessToken();
      const retryHeaders = Object.assign({}, headers, {
        Authorization: `Bearer ${nextAccessToken}`,
      });
      const retryResponse = await fetch(`${baseUrl}${path}`, {
        method,
        headers: retryHeaders,
        body,
        credentials: "include",
      });
      data = await parseResponse(retryResponse);
      if (!retryResponse.ok) {
        throw toHttpError(retryResponse, data);
      }
      return data;
    }

    if (!response.ok) {
      throw toHttpError(response, data);
    }
    return data;
  }

  async function login(input, options) {
    const email = String(input && input.email || "").trim();
    const password = String(input && input.password || "");
    const baseUrl = getBaseUrlOrThrow({ inputValue: options && options.baseUrl });
    const data = await request("/auth/login", {
      baseUrl,
      method: "POST",
      body: { email, password },
      retryOnAuth: false,
    });
    setBackendUrl(baseUrl);
    setTokens(data);
    return data;
  }

  async function register(input, options) {
    const email = String(input && input.email || "").trim();
    const password = String(input && input.password || "");
    const baseUrl = getBaseUrlOrThrow({ inputValue: options && options.baseUrl });
    return request("/auth/register", {
      baseUrl,
      method: "POST",
      body: { email, password },
      retryOnAuth: false,
    });
  }

  async function logout(options) {
    const baseUrl = resolveBackendUrl({ inputValue: options && options.baseUrl });
    try {
      if (baseUrl) {
        await request("/auth/logout", {
          baseUrl,
          method: "POST",
          body: {},
          retryOnAuth: false,
        });
      }
    } finally {
      clearSession();
    }
  }

  async function restoreSession(options) {
    if (hasAccessToken()) {
      return getAccessToken();
    }

    try {
      const refreshed = await refreshTokens(options);
      return String(refreshed && refreshed.accessToken || "");
    } catch {
      clearSession();
      return "";
    }
  }

  function ensureSession(redirectUrl) {
    if (hasAccessToken()) {
      return true;
    }
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
    return false;
  }

  window.LingvoAuthClient = Object.freeze({
    STORAGE_KEYS,
    messages: DEFAULT_MESSAGES,
    normalizeBaseUrl,
    getPublicBackendUrl,
    getStoredBackendUrl,
    resolveBackendUrl,
    getBaseUrlOrThrow,
    setBackendUrl,
    getAccessToken,
    hasAccessToken,
    setTokens,
    clearSession,
    request,
    login,
    register,
    refreshTokens,
    restoreSession,
    logout,
    ensureSession,
  });
})();
