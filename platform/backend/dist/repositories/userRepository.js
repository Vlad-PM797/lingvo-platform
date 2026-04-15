"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const db_1 = require("../db");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class UserRepository {
    async findByEmail(email) {
        try {
            logger_1.logger.info("db.users.find_by_email.start", { email: email.toLowerCase() });
            const queryResult = await db_1.dbPool.query("SELECT id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1", [email.toLowerCase()]);
            logger_1.logger.info("db.users.find_by_email.success", { email: email.toLowerCase(), rowCount: queryResult.rowCount });
            return queryResult.rows[0] ?? null;
        }
        catch (error) {
            logger_1.logger.error("db.users.find_by_email.error", error, { email: email.toLowerCase() });
            throw new errorHandler_1.HttpError(500, "Failed to read user");
        }
    }
    async findById(userId) {
        try {
            logger_1.logger.info("db.users.find_by_id.start", { userId });
            const queryResult = await db_1.dbPool.query("SELECT id, email, password_hash, role FROM users WHERE id = $1 LIMIT 1", [userId]);
            logger_1.logger.info("db.users.find_by_id.success", { userId, rowCount: queryResult.rowCount });
            return queryResult.rows[0] ?? null;
        }
        catch (error) {
            logger_1.logger.error("db.users.find_by_id.error", error, { userId });
            throw new errorHandler_1.HttpError(500, "Failed to read user");
        }
    }
    async createUser(email, passwordHash) {
        try {
            logger_1.logger.info("db.users.create.start", { email: email.toLowerCase() });
            const queryResult = await db_1.dbPool.query("INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, email, password_hash, role", [email.toLowerCase(), passwordHash]);
            logger_1.logger.info("db.users.create.success", { email: email.toLowerCase(), userId: queryResult.rows[0]?.id });
            return queryResult.rows[0];
        }
        catch (error) {
            logger_1.logger.error("db.users.create.error", error, { email: email.toLowerCase() });
            throw new errorHandler_1.HttpError(500, "Failed to create user");
        }
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
