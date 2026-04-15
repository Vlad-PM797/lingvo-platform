import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "./errorHandler";
import { userRepository } from "../repositories/userRepository";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: "user" | "admin";
}

interface AccessTokenPayload {
  sub: string;
  typ: "access";
}

export function requireAuth(request: AuthenticatedRequest, _response: Response, next: NextFunction): void {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing access token");
  }

  const token = authorizationHeader.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
    if (!payload?.sub || payload.typ !== "access") {
      throw new HttpError(401, "Invalid access token");
    }

    request.userId = payload.sub;
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired access token");
  }
}

export async function requireAdmin(request: AuthenticatedRequest, _response: Response, next: NextFunction): Promise<void> {
  requireAuth(request, _response, () => undefined);
  if (!request.userId) {
    throw new HttpError(401, "Unauthorized request");
  }

  const user = await userRepository.findById(request.userId);
  if (!user) {
    throw new HttpError(401, "Unauthorized request");
  }
  if (user.role !== "admin") {
    throw new HttpError(403, "Admin access required");
  }
  request.userRole = user.role;
  next();
}
