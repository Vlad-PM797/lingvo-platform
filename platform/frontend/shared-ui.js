(function () {
  "use strict";

  function createConsoleLogger(prefix) {
    return Object.freeze({
      info(operationName, payload = {}) {
        console.info(`[INFO] ${prefix}.${operationName}`, payload);
      },
      error(operationName, error, payload = {}) {
        console.error(`[ERROR] ${prefix}.${operationName}`, {
          message: error instanceof Error ? error.message : String(error),
          payload,
        });
      },
    });
  }

  function getLearningText(item) {
    return String(item?.learningText || item?.en || "");
  }

  function getTranslationText(item) {
    return String(item?.translationText || item?.ua || "");
  }

  function populateBackendUrlInput(inputElement, authClient) {
    if (!inputElement || !authClient) {
      return;
    }
    const savedBackendUrl = authClient.getStoredBackendUrl();
    if (savedBackendUrl) {
      inputElement.value = savedBackendUrl;
      return;
    }
    const publicUrl = authClient.getPublicBackendUrl();
    if (publicUrl) {
      inputElement.value = publicUrl;
    }
  }

  function bindBackendUrlInput(inputElement, authClient) {
    if (!inputElement || !authClient) {
      return;
    }
    inputElement.addEventListener("change", () => {
      const normalized = authClient.normalizeBaseUrl(inputElement.value);
      inputElement.value = normalized;
      authClient.setBackendUrl(normalized);
    });
  }

  function getBaseUrlOrThrow(authClient, inputElement) {
    return authClient.getBaseUrlOrThrow({
      inputValue: inputElement ? inputElement.value : "",
    });
  }

  function renderSelectOptions(selectElement, items, getValue, getLabel) {
    if (!selectElement) {
      return;
    }
    selectElement.innerHTML = "";
    for (const item of items) {
      const option = document.createElement("option");
      option.value = String(getValue(item));
      option.textContent = String(getLabel(item));
      selectElement.appendChild(option);
    }
  }

  window.LingvoFrontendShared = Object.freeze({
    createConsoleLogger,
    getLearningText,
    getTranslationText,
    populateBackendUrlInput,
    bindBackendUrlInput,
    getBaseUrlOrThrow,
    renderSelectOptions,
  });
})();
