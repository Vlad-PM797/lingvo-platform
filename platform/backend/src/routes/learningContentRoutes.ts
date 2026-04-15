import { Router } from "express";
import { learningContentController } from "../controllers/learningContentController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/authMiddleware";

export const learningContentRouter = Router();

learningContentRouter.use(requireAuth);
learningContentRouter.get("/courses", asyncHandler((request, response) => learningContentController.getCourses(request, response)));
learningContentRouter.get(
  "/courses/:courseId/lessons",
  asyncHandler((request, response) => learningContentController.getLessonsByCourse(request, response)),
);
learningContentRouter.get(
  "/lessons/:lessonId",
  asyncHandler((request, response) => learningContentController.getLessonById(request, response)),
);
