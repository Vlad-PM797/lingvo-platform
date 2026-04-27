import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../controllers/authController";
import { asyncHandler } from "../utils/asyncHandler";

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.use(authRateLimit);
authRouter.post("/register", asyncHandler((request, response) => authController.register(request, response)));
authRouter.post("/login", asyncHandler((request, response) => authController.login(request, response)));
authRouter.post("/refresh", asyncHandler((request, response) => authController.refresh(request, response)));
authRouter.post("/logout", asyncHandler((request, response) => authController.logout(request, response)));
authRouter.post("/remote-test-access", asyncHandler((request, response) => authController.verifyRemoteTestInvite(request, response)));
