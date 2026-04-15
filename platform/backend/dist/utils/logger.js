"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
class Logger {
    info(operation, payload = {}) {
        console.info(JSON.stringify({
            level: "info",
            operation,
            payload,
            at: new Date().toISOString(),
        }));
    }
    error(operation, error, payload = {}) {
        console.error(JSON.stringify({
            level: "error",
            operation,
            payload,
            message: error instanceof Error ? error.message : String(error),
            at: new Date().toISOString(),
        }));
    }
}
exports.Logger = Logger;
exports.logger = new Logger();
