"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = requestContextMiddleware;
const crypto_1 = require("crypto");
const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_MAX_LENGTH = 100;
function isValidRequestId(candidate) {
    if (typeof candidate !== "string") {
        return false;
    }
    const trimmed = candidate.trim();
    return trimmed.length > 0 && trimmed.length <= REQUEST_ID_MAX_LENGTH;
}
function requestContextMiddleware(request, response, next) {
    const incomingId = request.headers[REQUEST_ID_HEADER];
    const selectedRequestId = isValidRequestId(incomingId) ? incomingId.trim() : (0, crypto_1.randomUUID)();
    request.requestId = selectedRequestId;
    response.setHeader(REQUEST_ID_HEADER, selectedRequestId);
    next();
}
