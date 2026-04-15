import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

type ContextRequest = Request & { requestId?: string };

const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_MAX_LENGTH = 100;

function isValidRequestId(candidate: unknown): candidate is string {
  if (typeof candidate !== "string") {
    return false;
  }
  const trimmed = candidate.trim();
  return trimmed.length > 0 && trimmed.length <= REQUEST_ID_MAX_LENGTH;
}

export function requestContextMiddleware(request: ContextRequest, response: Response, next: NextFunction): void {
  const incomingId = request.headers[REQUEST_ID_HEADER];
  const selectedRequestId = isValidRequestId(incomingId) ? incomingId.trim() : randomUUID();

  request.requestId = selectedRequestId;
  response.setHeader(REQUEST_ID_HEADER, selectedRequestId);
  next();
}
