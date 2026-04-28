(function () {
  "use strict";

  const STORAGE_KEY = "lingvo_learning_language";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = Object.freeze([
    Object.freeze({ code: "en", labelUa: "Англійська", nativeLabel: "English", answerPlaceholder: "Введи відповідь англійською..." }),
    Object.freeze({ code: "it", labelUa: "Італійська", nativeLabel: "Italiano", answerPlaceholder: "Введи відповідь італійською..." }),
  ]);

  function getLanguageMeta(code) {
    return SUPPORTED_LANGUAGES.find((item) => item.code === code) || SUPPORTED_LANGUAGES[0];
  }

  function normalizeLanguageCode(rawValue) {
    const candidate = String(rawValue || "").trim().toLowerCase();
    return getLanguageMeta(candidate).code;
  }

  function getCurrentLanguage() {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return normalizeLanguageCode(stored || DEFAULT_LANGUAGE);
  }

  function setCurrentLanguage(languageCode) {
    const normalized = normalizeLanguageCode(languageCode);
    window.localStorage.setItem(STORAGE_KEY, normalized);
    try {
      window.dispatchEvent(new CustomEvent("lingvo-learning-language-changed", {
        detail: { languageCode: normalized, meta: getLanguageMeta(normalized) },
      }));
    } catch (_error) {
      // no-op
    }
    return normalized;
  }

  function applyToSelect(selectElement) {
    if (!selectElement) {
      return;
    }
    const current = getCurrentLanguage();
    selectElement.innerHTML = "";
    for (const language of SUPPORTED_LANGUAGES) {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = `${language.labelUa} (${language.nativeLabel})`;
      selectElement.appendChild(option);
    }
    selectElement.value = current;
    selectElement.addEventListener("change", function () {
      const nextLanguage = setCurrentLanguage(selectElement.value);
      selectElement.value = nextLanguage;
    }, { capture: true });
  }

  function autoInitSelectors() {
    const selectors = document.querySelectorAll("[data-learning-language-select]");
    selectors.forEach((node) => {
      applyToSelect(node);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitSelectors, { once: true });
  } else {
    autoInitSelectors();
  }

  window.LingvoLearningLanguage = Object.freeze({
    STORAGE_KEY,
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    getLanguageMeta,
    normalizeLanguageCode,
    getCurrentLanguage,
    setCurrentLanguage,
    applyToSelect,
  });
})();
