import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    logger.error("http.validation_error", error);
    response.status(400).json({
      message: "Validation failed",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof HttpError) {
    logger.error("http.handled_error", error, { statusCode: error.statusCode });
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  logger.error("http.unhandled_error", error);
  response.status(500).json({ message: "Internal server error" });
}
