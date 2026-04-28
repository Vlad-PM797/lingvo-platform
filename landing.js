import { logInfo, TOUR_STEPS } from "./landing-shared.js";
import { initLandingAuthModal } from "./landing-auth-modal.js";
import { initLandingFont } from "./landing-font.js";
import { initLandingProgressSync } from "./landing-progress.js";
import { initLandingTour } from "./landing-tour.js";

initLandingTour();
initLandingFont();
initLandingAuthModal();
initLandingProgressSync();

logInfo("landing.boot", { tourSteps: TOUR_STEPS.length });
