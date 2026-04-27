import {
  EN_UA_GLOSSARY as ENGLISH_GLOSSARY,
  LESSON_MATERIALS as ENGLISH_LESSON_MATERIALS,
  LESSON_STEPS as ENGLISH_LESSON_STEPS,
  PROJECT_INTROS as ENGLISH_PROJECT_INTROS,
} from "./english-content.js";
import {
  EN_UA_GLOSSARY as ITALIAN_GLOSSARY,
  LESSON_MATERIALS as ITALIAN_LESSON_MATERIALS,
  LESSON_STEPS as ITALIAN_LESSON_STEPS,
  PROJECT_INTROS as ITALIAN_PROJECT_INTROS,
} from "./italian-content.js";

const currentLanguage = window.LingvoLearningLanguage?.getCurrentLanguage?.() || "en";

const selectedContent = currentLanguage === "it"
  ? {
      glossary: ITALIAN_GLOSSARY,
      lessonMaterials: ITALIAN_LESSON_MATERIALS,
      lessonSteps: ITALIAN_LESSON_STEPS,
      projectIntros: ITALIAN_PROJECT_INTROS,
    }
  : {
      glossary: ENGLISH_GLOSSARY,
      lessonMaterials: ENGLISH_LESSON_MATERIALS,
      lessonSteps: ENGLISH_LESSON_STEPS,
      projectIntros: ENGLISH_PROJECT_INTROS,
    };

export const EN_UA_GLOSSARY = selectedContent.glossary;
export const LESSON_MATERIALS = selectedContent.lessonMaterials;
export const LESSON_STEPS = selectedContent.lessonSteps;
export const PROJECT_INTROS = selectedContent.projectIntros;
