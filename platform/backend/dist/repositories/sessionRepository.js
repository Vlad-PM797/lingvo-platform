"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = exports.SessionRepository = void 0;
const db_1 = require("../db");
class SessionRepository {
    async createSession(userId, refreshTokenHash, expiresAt) {
        const queryResult = await db_1.dbPool.query("INSERT INTO sessions (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id, user_id, refresh_token_hash, expires_at", [userId, refreshTokenHash, expiresAt.toISOString()]);
        return queryResult.rows[0];
    }
    async findByRefreshTokenHash(refreshTokenHash) {
        const queryResult = await db_1.dbPool.query("SELECT id, user_id, refresh_token_hash, expires_at FROM sessions WHERE refresh_token_hash = $1 LIMIT 1", [refreshTokenHash]);
        return queryResult.rows[0] ?? null;
    }
    async deleteByRefreshTokenHash(refreshTokenHash) {
        await db_1.dbPool.query("DELETE FROM sessions WHERE refresh_token_hash = $1", [refreshTokenHash]);
    }
}
exports.SessionRepository = SessionRepository;
exports.sessionRepository = new SessionRepository();
