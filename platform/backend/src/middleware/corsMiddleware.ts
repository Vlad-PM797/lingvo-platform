import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const ALLOW_ALL = "*";
const CORS_HEADERS = Object.freeze({
  allowMethods: "GET,POST,PUT,DELETE,OPTIONS",
  allowHeaders: "Content-Type,Authorization,X-Request-Id",
});

function isOriginAllowed(origin: string): boolean {
  if (env.corsAllowedOrigins.includes(ALLOW_ALL)) {
    return true;
  }
  return env.corsAllowedOrigins.includes(origin);
}

export function corsMiddleware(request: Request, response: Response, next: NextFunction): void {
  const originHeader = request.headers.origin;
  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;

  if (origin && isOriginAllowed(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (env.corsAllowedOrigins.includes(ALLOW_ALL) && origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (env.corsAllowedOrigins.includes(ALLOW_ALL)) {
    response.setHeader("Access-Control-Allow-Origin", ALLOW_ALL);
  }

  response.setHeader("Access-Control-Allow-Methods", CORS_HEADERS.allowMethods);
  response.setHeader("Access-Control-Allow-Headers", CORS_HEADERS.allowHeaders);

  if (request.method === "OPTIONS") {
    response.status(204).send();
    return;
  }

  next();
}
