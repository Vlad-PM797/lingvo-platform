import { Request, Response } from "express";
import { env } from "../config/env";

const REFRESH_COOKIE_NAME = "lingvo_refresh_token";

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const chunk of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = chunk.split("=");
    const name = rawName?.trim();
    if (!name) {
      continue;
    }
    result[name] = rawValueParts.join("=").trim();
  }
  return result;
}

function shouldUseSecureCookies(request: Request): boolean {
  const forwardedProto = String(request.headers["x-forwarded-proto"] || "").toLowerCase();
  const originHeader = request.headers.origin;
  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  return forwardedProto === "https" || String(origin || "").startsWith("https://");
}

function buildRefreshCookieValue(request: Request, refreshToken: string, expiresAt: Date): string {
  const secure = shouldUseSecureCookies(request);
  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  const parts = [
    `${REFRESH_COOKIE_NAME}=${refreshToken}`,
    "Path=/auth",
    "HttpOnly",
    `SameSite=${secure ? "None" : "Lax"}`,
    `Max-Age=${maxAgeSeconds}`,
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function buildClearRefreshCookieValue(request: Request): string {
  const secure = shouldUseSecureCookies(request);
  const parts = [
    `${REFRESH_COOKIE_NAME}=`,
    "Path=/auth",
    "HttpOnly",
    `SameSite=${secure ? "None" : "Lax"}`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function resolveRefreshTokenCookie(request: Request): string {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) {
    return "";
  }
  const cookies = parseCookieHeader(cookieHeader);
  return String(cookies[REFRESH_COOKIE_NAME] || "");
}

export function setRefreshTokenCookie(response: Response, request: Request, refreshToken: string): void {
  const expiresAt = new Date(Date.now() + env.jwtRefreshTtlDays * 24 * 60 * 60 * 1000);
  response.append("Set-Cookie", buildRefreshCookieValue(request, refreshToken, expiresAt));
}

export function clearRefreshTokenCookie(response: Response, request: Request): void {
  response.append("Set-Cookie", buildClearRefreshCookieValue(request));
}
