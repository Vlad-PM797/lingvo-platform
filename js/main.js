import { applyTrainerPageCopy, collectTrainerElements, createTrainerServices } from "./bootstrap.js";
import { TutorController } from "./app.js";

applyTrainerPageCopy();

const appController = new TutorController({
  ...createTrainerServices(),
  elements: collectTrainerElements(),
});

appController.initialize();
