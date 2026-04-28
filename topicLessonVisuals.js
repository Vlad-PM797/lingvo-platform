(function () {
  "use strict";

  const STORAGE_FORMAT = "lingvo_topic_format_override";
  const STORAGE_PALETTE = "lingvo_topic_palette_override";
  const FORMATS = Object.freeze(new Set(["auto", "vocab", "commands", "dialogue"]));
  const PALETTES = Object.freeze(new Set(["auto", "pastel", "vibrant", "monochrome"]));
  const PREFIX_FORMAT = "topic-format-";
  const PREFIX_PALETTE = "topic-palette-";

  function logTopic(operationName, payload) {
    try {
      console.info(`[LingvoTopicVisuals] ${operationName}`, payload || {});
    } catch (error) {
      console.error("[LingvoTopicVisuals] log_failed", error);
    }
  }

  function normalizeBlob(title, code) {
    return `${String(title || "")} ${String(code || "")}`.toLowerCase();
  }

  function inferFormat(title, code) {
    const blob = normalizeBlob(title, code);

    if (
      /\b(how to|procedure|passport|airport|phone call|at the bank|ticket|order food|directions|check-?in|customs|emergency|command)\b/i.test(
        blob,
      ) ||
      /(у банк|в аеропорт|на вокзал|паспорт|квиток|дзвінок|процедур|інструкц)/i.test(blob)
    ) {
      return "commands";
    }

    if (
      /\b(numbers?|digits?|counting|colors?|days of the week|months?|family|alphabet|vocabulary|words list|lexic)\b/i.test(blob) ||
      /(числ|лічил|кольор|дні тижн|місяц|алфавіт|лексик|словник|слова\b)/i.test(blob)
    ) {
      return "vocab";
    }

    if (
      /\b(greeting|introduction|daily phrases?|conversation|small talk|dialogue|speaking|useful phrases)\b/i.test(blob) ||
      /(привітан|знайомств|діалог|розмов|повсякден|фраз|спілкуван)/i.test(blob)
    ) {
      return "dialogue";
    }

    if (/\bbasics\s*0?1\b|a0-basics-01/i.test(blob)) {
      return "dialogue";
    }
    if (/\bbasics\s*0?2\b|a0-basics-02|address|місц|map|місто/i.test(blob)) {
      return "dialogue";
    }

    return "dialogue";
  }

  function paletteForFormat(format) {
    if (format === "vocab") {
      return "pastel";
    }
    if (format === "commands") {
      return "vibrant";
    }
    return "monochrome";
  }

  function getStoredFormat() {
    try {
      const raw = window.localStorage.getItem(STORAGE_FORMAT);
      return FORMATS.has(raw) ? raw : "auto";
    } catch (error) {
      logTopic("storage.read_format_failed", { message: String(error) });
      return "auto";
    }
  }

  function getStoredPalette() {
    try {
      const raw = window.localStorage.getItem(STORAGE_PALETTE);
      return PALETTES.has(raw) ? raw : "auto";
    } catch (error) {
      logTopic("storage.read_palette_failed", { message: String(error) });
      return "auto";
    }
  }

  function setStoredFormat(value) {
    try {
      if (!FORMATS.has(value)) {
        return;
      }
      window.localStorage.setItem(STORAGE_FORMAT, value);
    } catch (error) {
      logTopic("storage.write_format_failed", { message: String(error) });
    }
  }

  function setStoredPalette(value) {
    try {
      if (!PALETTES.has(value)) {
        return;
      }
      window.localStorage.setItem(STORAGE_PALETTE, value);
    } catch (error) {
      logTopic("storage.write_palette_failed", { message: String(error) });
    }
  }

  function stripTopicClasses(root) {
    const element = root || document.body;
    const toRemove = [];
    for (const cls of element.classList) {
      if (cls.startsWith(PREFIX_FORMAT) || cls.startsWith(PREFIX_PALETTE)) {
        toRemove.push(cls);
      }
    }
    for (const cls of toRemove) {
      element.classList.remove(cls);
    }
  }

  function resolveApplied(title, code) {
    const formatOverride = getStoredFormat();
    const paletteOverride = getStoredPalette();
    const resolvedFormat = formatOverride === "auto" ? inferFormat(title, code) : formatOverride;
    const resolvedPalette =
      paletteOverride === "auto" ? paletteForFormat(resolvedFormat) : paletteOverride;
    return { resolvedFormat, resolvedPalette };
  }

  function applyTopicVisuals(context) {
    try {
      const title = context && context.title != null ? String(context.title) : "";
      const code = context && context.code != null ? String(context.code) : "";
      const { resolvedFormat, resolvedPalette } = resolveApplied(title, code);
      stripTopicClasses(document.body);
      document.body.classList.add(PREFIX_FORMAT + resolvedFormat, PREFIX_PALETTE + resolvedPalette);
      logTopic("apply", { title, code, resolvedFormat, resolvedPalette });
      try {
        window.dispatchEvent(
          new CustomEvent("lingvo-topic-visual-applied", {
            detail: { format: resolvedFormat, palette: resolvedPalette, title, code },
          }),
        );
      } catch (error) {
        logTopic("dispatch_applied_failed", { message: String(error) });
      }
    } catch (error) {
      logTopic("apply_failed", { message: error instanceof Error ? error.message : String(error) });
    }
  }

  function clearTopicVisuals() {
    try {
      stripTopicClasses(document.body);
      logTopic("clear", {});
    } catch (error) {
      logTopic("clear_failed", { message: error instanceof Error ? error.message : String(error) });
    }
  }

  function readTrainerLessonContext() {
    try {
      const lessonSelect = document.getElementById("lessonSelect");
      if (!lessonSelect) {
        return { title: "", code: "" };
      }
      const option = lessonSelect.options[lessonSelect.selectedIndex];
      const text = String(option?.textContent || "")
        .replace(/^\s*\d+\.[\s)]+/i, "")
        .trim();
      const value = String(lessonSelect.value || "").trim();
      return { title: text, code: value };
    } catch (error) {
      logTopic("read_trainer_context_failed", { message: String(error) });
      return { title: "", code: "" };
    }
  }

  function readProjectLessonDropdownContext() {
    try {
      const lessonSelect = document.getElementById("lessonSelect");
      if (!lessonSelect) {
        return { title: "", code: "" };
      }
      const option = lessonSelect.options[lessonSelect.selectedIndex];
      const text = String(option?.textContent || "")
        .replace(/^\s*\d+\.[\s)]+/i, "")
        .trim();
      return { title: text, code: "" };
    } catch (error) {
      logTopic("read_project_dropdown_failed", { message: String(error) });
      return { title: "", code: "" };
    }
  }

  function syncSelectValues() {
    try {
      const formatSelect = document.getElementById("topicFormatSelect");
      const paletteSelect = document.getElementById("topicPaletteSelect");
      if (formatSelect) {
        formatSelect.value = getStoredFormat();
      }
      if (paletteSelect) {
        paletteSelect.value = getStoredPalette();
      }
    } catch (error) {
      logTopic("sync_selects_failed", { message: String(error) });
    }
  }

  function wireOverrideSelects(onChange) {
    try {
      const formatSelect = document.getElementById("topicFormatSelect");
      const paletteSelect = document.getElementById("topicPaletteSelect");
      if (!formatSelect || !paletteSelect) {
        return;
      }
      if (formatSelect.dataset.lingvoTopicOverridesWired === "1") {
        return;
      }
      formatSelect.dataset.lingvoTopicOverridesWired = "1";
      paletteSelect.dataset.lingvoTopicOverridesWired = "1";
      syncSelectValues();
      formatSelect.addEventListener("change", function () {
        setStoredFormat(formatSelect.value);
        onChange();
      });
      paletteSelect.addEventListener("change", function () {
        setStoredPalette(paletteSelect.value);
        onChange();
      });
    } catch (error) {
      logTopic("wire_overrides_failed", { message: String(error) });
    }
  }

  function wireTrainerLessonSelect() {
    try {
      const lessonSelect = document.getElementById("lessonSelect");
      if (!lessonSelect || !document.getElementById("trainerSceneMount")) {
        return;
      }
      if (lessonSelect.dataset.lingvoTopicLessonWired === "1") {
        return;
      }
      lessonSelect.dataset.lingvoTopicLessonWired = "1";
      const refresh = function () {
        applyTopicVisuals(readTrainerLessonContext());
      };
      lessonSelect.addEventListener("change", refresh);
      const startButton = document.getElementById("startLessonButton");
      if (startButton) {
        startButton.addEventListener("click", function () {
          window.setTimeout(refresh, 60);
        });
      }
      try {
        new MutationObserver(refresh).observe(lessonSelect, { childList: true, subtree: true });
      } catch (error) {
        logTopic("trainer_mutation_observer_failed", { message: String(error) });
      }
      window.setTimeout(refresh, 200);
    } catch (error) {
      logTopic("wire_trainer_lesson_failed", { message: String(error) });
    }
  }

  function wireProjectLessonSelect() {
    try {
      const lessonSelect = document.getElementById("lessonSelect");
      if (!lessonSelect || !document.getElementById("lessonSceneMount")) {
        return;
      }
      if (lessonSelect.dataset.lingvoTopicProjectWired === "1") {
        return;
      }
      lessonSelect.dataset.lingvoTopicProjectWired = "1";
      const refresh = function () {
        applyTopicVisuals(readProjectLessonDropdownContext());
      };
      lessonSelect.addEventListener("change", refresh);
      window.setTimeout(refresh, 120);
    } catch (error) {
      logTopic("wire_project_lesson_failed", { message: String(error) });
    }
  }

  function bootstrap() {
    try {
      wireOverrideSelects(function () {
        if (document.getElementById("trainerSceneMount")) {
          applyTopicVisuals(readTrainerLessonContext());
        } else if (document.getElementById("lessonSceneMount")) {
          applyTopicVisuals(readProjectLessonDropdownContext());
        }
      });
      wireTrainerLessonSelect();
      wireProjectLessonSelect();
      window.addEventListener("lingvo-lesson-context", function (event) {
        try {
          const detail = event && event.detail ? event.detail : {};
          applyTopicVisuals(detail);
        } catch (error) {
          logTopic("lesson_context_handler_failed", { message: String(error) });
        }
      });
    } catch (error) {
      logTopic("bootstrap_failed", { message: String(error) });
    }
  }

  window.LingvoTopicLessonVisuals = Object.freeze({
    apply: applyTopicVisuals,
    clear: clearTopicVisuals,
    inferFormat,
    getStoredFormat,
    getStoredPalette,
    setStoredFormat,
    setStoredPalette,
    syncSelectValues,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
