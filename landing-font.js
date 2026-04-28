import {
  els,
  logError,
  logInfo,
  UA_FONT_HTML_ATTRIBUTE,
  UA_FONT_MODE_DEFAULT,
  UA_FONT_MODE_RUTENIA,
  UA_FONT_STORAGE_KEY,
} from "./landing-shared.js";

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

export function initLandingFont() {
  initUaFontFromStorage();
  if (els.uaFontSelect) {
    els.uaFontSelect.addEventListener("change", handleUaFontChange);
  }
}
