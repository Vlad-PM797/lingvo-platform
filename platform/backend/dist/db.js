"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPool = void 0;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.closeDatabasePool = closeDatabasePool;
const pg_1 = require("pg");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
exports.dbPool = new pg_1.Pool({
    connectionString: env_1.env.databaseUrl,
});
exports.dbPool.on("error", (error) => {
    logger_1.logger.error("database.pool.error", error);
});
async function checkDatabaseHealth() {
    try {
        await exports.dbPool.query("SELECT 1");
        return true;
    }
    catch (error) {
        logger_1.logger.error("database.health.failed", error);
        return false;
    }
}
async function closeDatabasePool() {
    await exports.dbPool.end();
}
