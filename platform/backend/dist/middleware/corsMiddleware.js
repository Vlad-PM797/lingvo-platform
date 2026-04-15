"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = corsMiddleware;
const env_1 = require("../config/env");
const ALLOW_ALL = "*";
const CORS_HEADERS = Object.freeze({
    allowMethods: "GET,POST,PUT,DELETE,OPTIONS",
    allowHeaders: "Content-Type,Authorization,X-Request-Id",
});
function isOriginAllowed(origin) {
    if (env_1.env.corsAllowedOrigins.includes(ALLOW_ALL)) {
        return true;
    }
    return env_1.env.corsAllowedOrigins.includes(origin);
}
function corsMiddleware(request, response, next) {
    const originHeader = request.headers.origin;
    const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
    if (origin && isOriginAllowed(origin)) {
        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Vary", "Origin");
    }
    else if (env_1.env.corsAllowedOrigins.includes(ALLOW_ALL)) {
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
