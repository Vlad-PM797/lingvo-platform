"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../utils/logger");
const runtimeMetrics_1 = require("../observability/runtimeMetrics");
function requestLogger(request, response, next) {
    const startedAt = Date.now();
    response.on("finish", () => {
        const durationMs = Date.now() - startedAt;
        runtimeMetrics_1.runtimeMetrics.onRequestFinished(response.statusCode, durationMs);
        logger_1.logger.info("http.request", {
            requestId: request.requestId ?? "missing_request_id",
            method: request.method,
            path: request.path,
            statusCode: response.statusCode,
            durationMs,
        });
    });
    next();
}
