import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
import { testerActivityRepository } from "../repositories/testerActivityRepository";
import { logger } from "../utils/logger";

const UNKNOWN_IP = "unknown";
const UNKNOWN_USER_AGENT = "unknown";

function getClientIpAddress(request: AuthenticatedRequest): string {
  const forwardedFor = request.headers["x-forwarded-for"];
  const forwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return request.ip || UNKNOWN_IP;
}

function getOriginValue(request: AuthenticatedRequest): string {
  const originHeader = request.headers.origin;
  if (typeof originHeader === "string") {
    return originHeader.trim();
  }
  return "";
}

function getUserAgentValue(request: AuthenticatedRequest): string {
  const userAgentHeader = request.headers["user-agent"];
  if (typeof userAgentHeader === "string" && userAgentHeader.trim().length > 0) {
    return userAgentHeader.trim();
  }
  return UNKNOWN_USER_AGENT;
}

export async function captureTesterActivity(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  if (!request.userId) {
    next();
    return;
  }

  try {
    await testerActivityRepository.touchActivity({
      userId: request.userId,
      ipAddress: getClientIpAddress(request),
      userAgent: getUserAgentValue(request),
      origin: getOriginValue(request),
      requestPath: request.originalUrl || request.path || "",
    });
  } catch (error) {
    logger.error("tester_activity.middleware.capture_failed", error, {
      userId: request.userId,
      path: request.originalUrl || request.path,
    });
    // Не блокуємо основний флоу навчання/логіну через проблеми аналітики.
  }

  next();
}
