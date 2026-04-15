import { Request, Response } from "express";
import { authService } from "../services/authService";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "../schemas/authSchemas";
import { logger } from "../utils/logger";

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
    response.status(200).json(tokens);
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
