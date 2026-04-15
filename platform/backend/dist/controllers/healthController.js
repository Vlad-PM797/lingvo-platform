"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = exports.HealthController = void 0;
const db_1 = require("../db");
const runtimeMetrics_1 = require("../observability/runtimeMetrics");
class HealthController {
    async getHealth(_request, response) {
        const dbOk = await (0, db_1.checkDatabaseHealth)();
        response.status(dbOk ? 200 : 503).json({
            status: dbOk ? "ok" : "degraded",
            database: dbOk ? "up" : "down",
            at: new Date().toISOString(),
        });
    }
    async getLiveness(_request, response) {
        response.status(200).json({
            status: "alive",
            at: new Date().toISOString(),
        });
    }
    async getReadiness(_request, response) {
        const dbOk = await (0, db_1.checkDatabaseHealth)();
        response.status(dbOk ? 200 : 503).json({
            status: dbOk ? "ready" : "not_ready",
            checks: {
                database: dbOk ? "up" : "down",
            },
            at: new Date().toISOString(),
        });
    }
    async getMetrics(_request, response) {
        response.status(200).json({
            service: "lingvo-backend",
            metrics: runtimeMetrics_1.runtimeMetrics.getSnapshot(),
            at: new Date().toISOString(),
        });
    }
}
exports.HealthController = HealthController;
exports.healthController = new HealthController();
