const LingvoUiTheme = Object.freeze({
  storageKey: "lingvo_ui_theme",
  light: "light",
  dark: "dark",
});

function logThemeInfo(operationName, payload) {
  console.info(`[INFO] ${operationName}`, payload || {});
}

function logThemeError(operationName, error, payload) {
  console.error(`[ERROR] ${operationName}`, {
    message: error instanceof Error ? error.message : String(error),
    payload: payload || {},
  });
}

function findThemeControls() {
  const portalButton = document.getElementById("portalThemeToggle");
  const portalLabel = document.getElementById("portalThemeToggleLabel");
  if (portalButton && portalLabel) {
    return { button: portalButton, label: portalLabel };
  }
  const landingButton = document.getElementById("themeToggle");
  const landingLabel = document.getElementById("themeToggleLabel");
  if (landingButton && landingLabel) {
    return { button: landingButton, label: landingLabel };
  }
  return null;
}

function applyUiTheme(themeName, labelNode, buttonNode) {
  try {
    if (themeName === LingvoUiTheme.light) {
      document.documentElement.setAttribute("data-theme", LingvoUiTheme.light);
      buttonNode.setAttribute("aria-pressed", "true");
      labelNode.textContent = "Темна";
    } else {
      document.documentElement.removeAttribute("data-theme");
      buttonNode.setAttribute("aria-pressed", "false");
      labelNode.textContent = "Світла";
    }
  } catch (error) {
    logThemeError("ui_theme.apply.failed", error, { themeName });
  }
}

function initUiTheme() {
  const controls = findThemeControls();
  if (!controls) {
    return;
  }
  const { button, label } = controls;
  try {
    const saved = window.localStorage.getItem(LingvoUiTheme.storageKey);
    const initial = saved === LingvoUiTheme.light ? LingvoUiTheme.light : LingvoUiTheme.dark;
    applyUiTheme(initial, label, button);
    logThemeInfo("ui_theme.init", { theme: initial });
  } catch (error) {
    logThemeError("ui_theme.init.failed", error, {});
    applyUiTheme(LingvoUiTheme.dark, label, button);
  }
  button.addEventListener("click", () => {
    try {
      const isLight = document.documentElement.getAttribute("data-theme") === LingvoUiTheme.light;
      const next = isLight ? LingvoUiTheme.dark : LingvoUiTheme.light;
      window.localStorage.setItem(LingvoUiTheme.storageKey, next);
      const applied = next === LingvoUiTheme.light ? LingvoUiTheme.light : LingvoUiTheme.dark;
      applyUiTheme(applied, label, button);
      logThemeInfo("ui_theme.toggle", { next: applied });
    } catch (error) {
      logThemeError("ui_theme.toggle.failed", error, {});
    }
  });
}

function bootUiTheme() {
  initUiTheme();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootUiTheme);
} else {
  bootUiTheme();
}
