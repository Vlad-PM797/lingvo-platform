import { Request, Response } from "express";
import { authService } from "../services/authService";
import { loginSchema, logoutSchema, refreshSchema, registerSchema, remoteTestInviteSchema } from "../schemas/authSchemas";
import { logger } from "../utils/logger";
import { clearRefreshTokenCookie, resolveRefreshTokenCookie, setRefreshTokenCookie } from "../utils/authCookieUtils";
import { HttpError } from "../middleware/errorHandler";

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
    setRefreshTokenCookie(response, request, tokens.refreshToken);
    response.status(200).json({ accessToken: tokens.accessToken });
  }

  async refresh(request: Request, response: Response): Promise<void> {
    const input = refreshSchema.parse(request.body ?? {});
    logger.info("auth.refresh.attempt");
    const refreshToken = input.refreshToken || resolveRefreshTokenCookie(request);
    if (!refreshToken) {
      throw new HttpError(401, "Missing refresh token");
    }
    const tokens = await authService.refresh(refreshToken);
    setRefreshTokenCookie(response, request, tokens.refreshToken);
    response.status(200).json({ accessToken: tokens.accessToken });
  }

  async logout(request: Request, response: Response): Promise<void> {
    const input = logoutSchema.parse(request.body ?? {});
    logger.info("auth.logout.attempt");
    const refreshToken = input.refreshToken || resolveRefreshTokenCookie(request);
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshTokenCookie(response, request);
    response.status(200).json({ success: true });
  }

  async verifyRemoteTestInvite(request: Request, response: Response): Promise<void> {
    const input = remoteTestInviteSchema.parse(request.body);
    logger.info("auth.remote_test_invite.verify");
    const result = authService.verifyRemoteTestInvite(input.inviteKey);
    response.status(200).json(result);
  }
}

export const authController = new AuthController();
