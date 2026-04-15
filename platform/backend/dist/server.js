"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const db_1 = require("./db");
const logger_1 = require("./utils/logger");
let serverInstance = null;
let shuttingDown = false;
async function shutdown(signal) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    logger_1.logger.info("server.shutdown.started", { signal });
    try {
        await new Promise((resolve, reject) => {
            if (!serverInstance) {
                resolve();
                return;
            }
            serverInstance.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        await (0, db_1.closeDatabasePool)();
        logger_1.logger.info("server.shutdown.completed");
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error("server.shutdown.failed", error);
        process.exit(1);
    }
}
async function start() {
    try {
        const app = (0, app_1.buildApp)();
        serverInstance = app.listen(env_1.env.port, () => {
            logger_1.logger.info("server.started", { port: env_1.env.port, nodeEnv: env_1.env.nodeEnv });
        });
    }
    catch (error) {
        logger_1.logger.error("server.start.failed", error);
        process.exit(1);
    }
}
process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
process.on("unhandledRejection", (reason) => {
    logger_1.logger.error("process.unhandled_rejection", reason);
});
process.on("uncaughtException", (error) => {
    logger_1.logger.error("process.uncaught_exception", error);
});
void start();
