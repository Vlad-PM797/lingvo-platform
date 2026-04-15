import { dbPool } from "../db";

export interface SessionRecord {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  expires_at: Date;
}

export class SessionRepository {
  async createSession(userId: string, refreshTokenHash: string, expiresAt: Date): Promise<SessionRecord> {
    const queryResult = await dbPool.query<SessionRecord>(
      "INSERT INTO sessions (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id, user_id, refresh_token_hash, expires_at",
      [userId, refreshTokenHash, expiresAt.toISOString()],
    );
    return queryResult.rows[0];
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<SessionRecord | null> {
    const queryResult = await dbPool.query<SessionRecord>(
      "SELECT id, user_id, refresh_token_hash, expires_at FROM sessions WHERE refresh_token_hash = $1 LIMIT 1",
      [refreshTokenHash],
    );
    return queryResult.rows[0] ?? null;
  }

  async deleteByRefreshTokenHash(refreshTokenHash: string): Promise<void> {
    await dbPool.query("DELETE FROM sessions WHERE refresh_token_hash = $1", [refreshTokenHash]);
  }
}

export const sessionRepository = new SessionRepository();
