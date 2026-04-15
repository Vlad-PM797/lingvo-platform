import { Router } from "express";
import { healthController } from "../controllers/healthController";
import { asyncHandler } from "../utils/asyncHandler";

export const healthRouter = Router();

healthRouter.get("/", asyncHandler((request, response) => healthController.getHealth(request, response)));
healthRouter.get("/live", asyncHandler((request, response) => healthController.getLiveness(request, response)));
healthRouter.get("/ready", asyncHandler((request, response) => healthController.getReadiness(request, response)));
healthRouter.get("/metrics", asyncHandler((request, response) => healthController.getMetrics(request, response)));
