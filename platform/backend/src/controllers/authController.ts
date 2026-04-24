import { Request, Response } from "express";
import { authService } from "../services/authService";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "../schemas/authSchemas";
import { logger } from "../utils/logger";
import { testerActivityRepository } from "../repositories/testerActivityRepository";

function resolveClientIp(request: Request): string {
  const forwardedFor = request.headers["x-forwarded-for"];
  const forwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return request.ip || "unknown";
}

function resolveUserAgent(request: Request): string {
  const userAgent = request.headers["user-agent"];
  if (typeof userAgent === "string" && userAgent.trim().length > 0) {
    return userAgent.trim();
  }
  return "unknown";
}

function resolveOrigin(request: Request): string {
  return typeof request.headers.origin === "string" ? request.headers.origin.trim() : "";
}

export class AuthController {
  async register(request: Request, response: Response): Promise<void> {
    const input = registerSchema.parse(request.body);
    logger.info("auth.register.attempt", { email: input.email });
    const createdUser = await authService.register(input.email, input.password);
    response.status(201).json(createdUser);
  }

  async login(request: Request, response: Response): Promise<void> {
    const input = loginSchema.parse(request.body);
    logger.info("auth.login.attempt", { email: input.email });
    const tokens = await authService.login(input.email, input.password);
    try {
      await testerActivityRepository.touchActivity({
        userId: tokens.userId,
        ipAddress: resolveClientIp(request),
        userAgent: resolveUserAgent(request),
        origin: resolveOrigin(request),
        requestPath: request.originalUrl || request.path || "",
      });
    } catch (error) {
      logger.error("auth.login.activity_capture.failed", error, { email: input.email });
    }
    response.status(200).json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  }

  async refresh(request: Request, response: Response): Promise<void> {
    const input = refreshSchema.parse(request.body);
    logger.info("auth.refresh.attempt");
    const tokens = await authService.refresh(input.refreshToken);
    response.status(200).json(tokens);
  }

  async logout(request: Request, response: Response): Promise<void> {
    const input = logoutSchema.parse(request.body);
    logger.info("auth.logout.attempt");
    await authService.logout(input.refreshToken);
    response.status(200).json({ success: true });
  }
}

export const authController = new AuthController();
