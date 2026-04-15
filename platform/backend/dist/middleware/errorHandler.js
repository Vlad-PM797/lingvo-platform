"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.HttpError = HttpError;
function errorHandler(error, _request, response, _next) {
    if (error instanceof zod_1.ZodError) {
        logger_1.logger.error("http.validation_error", error);
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
        logger_1.logger.error("http.handled_error", error, { statusCode: error.statusCode });
        response.status(error.statusCode).json({ message: error.message });
        return;
    }
    logger_1.logger.error("http.unhandled_error", error);
    response.status(500).json({ message: "Internal server error" });
}
