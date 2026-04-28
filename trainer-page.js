(function () {
  "use strict";

  const TRAINER_VARIANT_STORAGE_KEY = "lingvo_trainer_variant";
  const TRAINER_VARIANTS = new Set([
    "neon-mentor",
    "command-center",
    "ai-classroom",
    "cyber-lab",
    "hybrid-owl",
  ]);

  function applyTrainerVariant(selectElement, variantName) {
    for (const name of TRAINER_VARIANTS) {
      document.body.classList.remove(`trainer-variant-${name}`);
    }
    const safeVariant = TRAINER_VARIANTS.has(variantName) ? variantName : "hybrid-owl";
    document.body.classList.add(`trainer-variant-${safeVariant}`);
    window.localStorage.setItem(TRAINER_VARIANT_STORAGE_KEY, safeVariant);
    selectElement.value = safeVariant;
  }

  function setupTrainerVariantSelector() {
    const selectElement = document.getElementById("trainerVariantSelect");
    if (!selectElement) {
      return;
    }

    const savedVariant = window.localStorage.getItem(TRAINER_VARIANT_STORAGE_KEY) || "hybrid-owl";
    applyTrainerVariant(selectElement, savedVariant);
    selectElement.addEventListener("change", () => {
      applyTrainerVariant(selectElement, selectElement.value);
    });
  }

  function buildSceneCatalog() {
    return Object.freeze({
      lesson1: window.LingvoLessonScenes?.getByLessonCode("a0-basics-01") || [],
      lesson2: window.LingvoLessonScenes?.getByLessonCode("a0-basics-02") || [],
    });
  }

  function resolveTrainerLessonKey(lessonSelect) {
    const selectedOption = lessonSelect.options[lessonSelect.selectedIndex];
    const label = String(selectedOption?.textContent || "").toLowerCase();
    const value = String(lessonSelect.value || "").toLowerCase();
    if (label.includes("урок 1") || label.includes("lesson 1") || label.includes("basics")) {
      return "lesson1";
    }
    if (label.includes("basi 01") || value.includes("it-a0-basics-01")) {
      return "lesson1";
    }
    if (label.includes("урок 2") || label.includes("lesson 2")) {
      return "lesson2";
    }
    if (label.includes("lezione 02") || value.includes("it-a0-basics-02")) {
      return "lesson2";
    }
    if (value.includes("a0-basics-01")) {
      return "lesson1";
    }
    if (value.includes("a0-basics-02")) {
      return "lesson2";
    }
    return "";
  }

  function createSceneCard(scene) {
    const card = document.createElement("article");
    card.className = "trainer-scene-card";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "trainer-scene-open";
    openButton.setAttribute("aria-label", `Відкрити сцену: ${scene.alt}`);

    const image = document.createElement("img");
    image.className = "trainer-scene-image";
    image.src = scene.src || scene.svgPath || "";
    image.alt = scene.alt || scene.altTextUa || "";
    image.loading = "lazy";
    openButton.appendChild(image);
    openButton.addEventListener("click", () => {
      const targetSrc = scene.src || scene.svgPath || "";
      window.open(targetSrc, "_blank", "noopener,noreferrer");
    });

    const caption = document.createElement("div");
    caption.className = "trainer-scene-caption";

    const learningLine = document.createElement("p");
    learningLine.className = "trainer-scene-en";
    learningLine.textContent = String(scene.en || "");

    const translationLine = document.createElement("p");
    translationLine.className = "trainer-scene-ua";
    translationLine.textContent = String(scene.ua || scene.altTextUa || "");

    caption.appendChild(learningLine);
    caption.appendChild(translationLine);
    card.appendChild(openButton);
    card.appendChild(caption);
    return card;
  }

  function createSceneHeading(sceneMount) {
    const heading = document.createElement("h3");
    heading.className = "trainer-scene-heading";
    heading.textContent = "Сцени до діалогів (MVP)";

    const nav = document.createElement("div");
    nav.className = "trainer-scene-nav";

    const prevButton = document.createElement("button");
    prevButton.type = "button";
    prevButton.className = "trainer-scene-nav-btn";
    prevButton.textContent = "↑";
    prevButton.setAttribute("aria-label", "Прокрутити сцени вгору");

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "trainer-scene-nav-btn";
    nextButton.textContent = "↓";
    nextButton.setAttribute("aria-label", "Прокрутити сцени вниз");

    nav.appendChild(prevButton);
    nav.appendChild(nextButton);

    const headingRow = document.createElement("div");
    headingRow.className = "trainer-scene-heading-row";
    headingRow.appendChild(heading);
    headingRow.appendChild(nav);
    sceneMount.appendChild(headingRow);

    return { prevButton, nextButton };
  }

  function renderTrainerScenes(sceneMount, mainStage, lessonSelect, sceneByLessonKey) {
    const lessonKey = resolveTrainerLessonKey(lessonSelect);
    const scenes = sceneByLessonKey[lessonKey] || [];
    sceneMount.innerHTML = "";

    if (!scenes.length) {
      sceneMount.hidden = true;
      if (mainStage) {
        mainStage.classList.add("trainer-main-stage--no-rail");
      }
      return;
    }

    if (mainStage) {
      mainStage.classList.remove("trainer-main-stage--no-rail");
    }

    const { prevButton, nextButton } = createSceneHeading(sceneMount);
    const grid = document.createElement("div");
    grid.className = "trainer-scene-grid";
    for (const scene of scenes) {
      grid.appendChild(createSceneCard(scene));
    }
    sceneMount.appendChild(grid);

    prevButton.addEventListener("click", () => {
      grid.scrollBy({ top: -Math.max(160, grid.clientHeight * 0.85), behavior: "smooth" });
    });
    nextButton.addEventListener("click", () => {
      grid.scrollBy({ top: Math.max(160, grid.clientHeight * 0.85), behavior: "smooth" });
    });
    sceneMount.hidden = false;
  }

  function setupTrainerSceneRail() {
    const sceneMount = document.getElementById("trainerSceneMount");
    const mainStage = document.querySelector(".trainer-main-stage");
    const lessonSelect = document.getElementById("lessonSelect");
    const learningLanguageSelect = document.getElementById("trainerLearningLanguageSelect");
    const startLessonButton = document.getElementById("startLessonButton");
    if (!sceneMount || !lessonSelect) {
      return;
    }

    const sceneByLessonKey = buildSceneCatalog();
    const renderScenes = () => {
      renderTrainerScenes(sceneMount, mainStage, lessonSelect, sceneByLessonKey);
    };

    lessonSelect.addEventListener("change", renderScenes);
    learningLanguageSelect?.addEventListener("change", () => {
      window.location.reload();
    });
    startLessonButton?.addEventListener("click", () => {
      window.setTimeout(renderScenes, 30);
    });

    new MutationObserver(renderScenes).observe(lessonSelect, { childList: true, subtree: true });
    window.setTimeout(renderScenes, 150);
  }

  setupTrainerVariantSelector();
  setupTrainerSceneRail();
})();
