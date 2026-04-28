import { els, logError, logInfo, state, TOUR_STEPS } from "./landing-shared.js";

function clearTourHighlights() {
  [els.navHome, els.navCourses, els.navProfile].forEach((node) => {
    node?.classList.remove("is-tour-target");
  });
}

function showPanel(panelId) {
  document.querySelectorAll(".platform-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === panelId);
  });
}

function bindNavClicks() {
  document.querySelectorAll(".platform-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panelId = btn.getAttribute("data-panel");
      if (!panelId) {
        return;
      }
      showPanel(panelId);
    });
  });
}

function renderTourStep() {
  const step = TOUR_STEPS[state.tourIndex];
  if (!step) {
    return;
  }
  clearTourHighlights();
  const navBtn = document.getElementById(step.navId);
  navBtn?.classList.add("is-tour-target");
  showPanel(step.panelId);
  els.tourTitle.textContent = step.title;
  els.tourText.textContent = step.text;
  els.tourNext.textContent = state.tourIndex === TOUR_STEPS.length - 1 ? "Завершити" : "Далі";
}

function openGuestTour() {
  try {
    els.platformShell.hidden = false;
    els.platformShell.classList.add("is-open");
    state.tourIndex = 0;
    renderTourStep();
    logInfo("guest_tour.open", { step: state.tourIndex });
  } catch (error) {
    logError("guest_tour.open.failed", error, {});
  }
}

function closeGuestTour() {
  try {
    els.platformShell.classList.remove("is-open");
    els.platformShell.hidden = true;
    clearTourHighlights();
    logInfo("guest_tour.close", {});
  } catch (error) {
    logError("guest_tour.close.failed", error, {});
  }
}

function tourNext() {
  try {
    if (state.tourIndex >= TOUR_STEPS.length - 1) {
      closeGuestTour();
      return;
    }
    state.tourIndex += 1;
    renderTourStep();
    logInfo("guest_tour.step", { index: state.tourIndex });
  } catch (error) {
    logError("guest_tour.step.failed", error, {});
  }
}

export function initLandingTour() {
  bindNavClicks();
  els.openGuestTour.addEventListener("click", openGuestTour);
  els.tourNext.addEventListener("click", tourNext);
  els.tourSkip.addEventListener("click", closeGuestTour);
}
