import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { runtimeMetrics } from "../observability/runtimeMetrics";

type ContextRequest = Request & { requestId?: string };

export function requestLogger(request: ContextRequest, response: Response, next: NextFunction): void {
  const startedAt = Date.now();

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    runtimeMetrics.onRequestFinished(response.statusCode, durationMs);
    logger.info("http.request", {
      requestId: request.requestId ?? "missing_request_id",
      method: request.method,
      path: request.path,
      statusCode: response.statusCode,
      durationMs,
    });
  });

  next();
}
