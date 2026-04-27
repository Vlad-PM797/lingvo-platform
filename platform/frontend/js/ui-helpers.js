import { APP_CONFIG } from "./config.js";
import { EN_UA_GLOSSARY } from "./content.js";

export function getLearningText(item) {
  return item?.learningText || item?.en || "";
}

export function getTranslationText(item) {
  return item?.translationText || item?.ua || "";
}

export function buildWordListMessage(projectName, words) {
  const lines = [`Словник теми ${projectName} (${APP_CONFIG.LEARNING_LANGUAGE_LABEL_UA} - українська):`];
  for (const wordItem of words) {
    lines.push(`- ${getLearningText(wordItem)} - ${getTranslationText(wordItem)}`);
  }
  return lines.join("\n");
}

export function buildPhraseListMessage(projectName, phrases) {
  const lines = [`Фрази теми ${projectName} (${APP_CONFIG.LEARNING_LANGUAGE_LABEL_UA} - українська):`];
  for (const phraseItem of phrases) {
    lines.push(`- ${getLearningText(phraseItem)} - ${getTranslationText(phraseItem)}`);
  }
  return lines.join("\n");
}

export function applyHintsVisibilityClass(enabled) {
  const bodyClassList = document.body.classList;
  if (enabled) {
    bodyClassList.remove("hints-disabled");
  } else {
    bodyClassList.add("hints-disabled");
  }
}

export function getTranslationToggleButtonLabel(enabled) {
  return enabled ? "Ховати підказки перекладу" : "Показувати підказки перекладу";
}

export function getInputPlaceholder() {
  return `Напиши ${APP_CONFIG.LEARNING_LANGUAGE_LABEL_UA} або українською...`;
}

export function renderTextWithGlossary(containerElement, sourceText, translationHintsEnabled) {
  if (!translationHintsEnabled) {
    containerElement.textContent = sourceText;
    return;
  }

  const escapedText = escapeHtml(sourceText);
  const lines = escapedText.split("\n");
  const sortedEntries = Object.entries(EN_UA_GLOSSARY)
    .map(([phrase, translation]) => [phrase.toLowerCase(), translation])
    .sort((a, b) => b[0].length - a[0].length);
  const phrasePattern = sortedEntries.map(([phrase]) => escapeRegex(escapeHtml(phrase))).join("|");
  const phraseRegex = phrasePattern ? new RegExp(`\\b(?:${phrasePattern})\\b`, "gi") : null;
  const glossaryMap = new Map(sortedEntries);

  const transformedLines = lines.map((line) => {
    if (!phraseRegex) {
      return line;
    }

    return line.replace(phraseRegex, (matchedText) => {
      const translation = glossaryMap.get(matchedText.toLowerCase());
      if (!translation) {
        return matchedText;
      }

      return `<span class="hint-word" data-ua="${escapeAttribute(translation)}">${matchedText}</span>`;
    });
  });

  containerElement.innerHTML = transformedLines.join("<br>");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return String(value).replace(/"/g, "&quot;");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
