import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpError } from "../middleware/errorHandler";
import { submitAttemptSchema } from "../schemas/learningSchemas";
import { learningProgressService } from "../services/learningProgressService";
import { LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { logger } from "../utils/logger";

export class LearningProgressController {
  async submitAttempt(request: AuthenticatedRequest, response: Response): Promise<void> {
    if (!request.userId) {
      throw new HttpError(401, LEARNING_ERROR_MESSAGES.unauthorized);
    }

    const input = submitAttemptSchema.parse(request.body);
    logger.info("learning.progress.submit_attempt.attempt", {
      userId: request.userId,
      lessonId: input.lessonId,
      promptType: input.promptType,
    });
    const result = await learningProgressService.submitAttempt({
      userId: request.userId,
      lessonId: input.lessonId,
      promptType: input.promptType,
      sourceText: input.sourceText,
      expectedAnswers: input.expectedAnswers,
      userAnswer: input.userAnswer,
    });
    response.status(201).json(result);
  }

  async getMyProgress(request: AuthenticatedRequest, response: Response): Promise<void> {
    if (!request.userId) {
      throw new HttpError(401, LEARNING_ERROR_MESSAGES.unauthorized);
    }

    logger.info("learning.progress.get_my.attempt", { userId: request.userId });
    const progress = await learningProgressService.getMyProgress(request.userId);
    response.status(200).json(progress);
  }
}

export const learningProgressController = new LearningProgressController();
