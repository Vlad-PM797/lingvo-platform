import { Router } from "express";
import { adminController } from "../controllers/adminController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin } from "../middleware/authMiddleware";

export const adminRouter = Router();

adminRouter.use(asyncHandler((request, response, next) => requireAdmin(request, response, next)));

adminRouter.post("/courses", asyncHandler((request, response) => adminController.createCourse(request, response)));
adminRouter.put("/courses/:courseId", asyncHandler((request, response) => adminController.updateCourse(request, response)));
adminRouter.delete(
  "/courses/:courseId",
  asyncHandler((request, response) => adminController.deactivateCourse(request, response)),
);

adminRouter.post("/lessons", asyncHandler((request, response) => adminController.createLesson(request, response)));
adminRouter.put("/lessons/:lessonId", asyncHandler((request, response) => adminController.updateLesson(request, response)));
adminRouter.delete(
  "/lessons/:lessonId",
  asyncHandler((request, response) => adminController.deactivateLesson(request, response)),
);

adminRouter.post("/words", asyncHandler((request, response) => adminController.createWord(request, response)));
adminRouter.put("/words/:wordId", asyncHandler((request, response) => adminController.updateWord(request, response)));
adminRouter.delete("/words/:wordId", asyncHandler((request, response) => adminController.deleteWord(request, response)));

adminRouter.post("/phrases", asyncHandler((request, response) => adminController.createPhrase(request, response)));
adminRouter.put("/phrases/:phraseId", asyncHandler((request, response) => adminController.updatePhrase(request, response)));
adminRouter.delete(
  "/phrases/:phraseId",
  asyncHandler((request, response) => adminController.deletePhrase(request, response)),
);
