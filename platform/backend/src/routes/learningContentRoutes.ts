import { Router } from "express";
import { learningContentController } from "../controllers/learningContentController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/authMiddleware";
import { captureTesterActivity } from "../middleware/testerActivityMiddleware";

export const learningContentRouter = Router();

learningContentRouter.use(requireAuth);
learningContentRouter.use(asyncHandler((request, response, next) => captureTesterActivity(request, response, next)));
learningContentRouter.get("/courses", asyncHandler((request, response) => learningContentController.getCourses(request, response)));
learningContentRouter.get(
  "/courses/:courseId/lessons",
  asyncHandler((request, response) => learningContentController.getLessonsByCourse(request, response)),
);
learningContentRouter.get(
  "/lessons/:lessonId",
  asyncHandler((request, response) => learningContentController.getLessonById(request, response)),
);
