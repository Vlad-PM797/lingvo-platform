import { Router } from "express";
import { learningProgressController } from "../controllers/learningProgressController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/authMiddleware";
import { captureTesterActivity } from "../middleware/testerActivityMiddleware";

export const learningProgressRouter = Router();

learningProgressRouter.use(requireAuth);
learningProgressRouter.use(asyncHandler((request, response, next) => captureTesterActivity(request, response, next)));
learningProgressRouter.post("/attempts", asyncHandler((request, response) => learningProgressController.submitAttempt(request, response)));
learningProgressRouter.get("/progress/me", asyncHandler((request, response) => learningProgressController.getMyProgress(request, response)));
