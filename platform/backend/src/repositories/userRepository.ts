import { dbPool } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: "user" | "admin";
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    try {
      logger.info("db.users.find_by_email.start", { email: email.toLowerCase() });
      const queryResult = await dbPool.query<UserRecord>(
        "SELECT id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1",
        [email.toLowerCase()],
      );
      logger.info("db.users.find_by_email.success", { email: email.toLowerCase(), rowCount: queryResult.rowCount });
      return queryResult.rows[0] ?? null;
    } catch (error) {
      logger.error("db.users.find_by_email.error", error, { email: email.toLowerCase() });
      throw new HttpError(500, "Failed to read user");
    }
  }

  async findById(userId: string): Promise<UserRecord | null> {
    try {
      logger.info("db.users.find_by_id.start", { userId });
      const queryResult = await dbPool.query<UserRecord>(
        "SELECT id, email, password_hash, role FROM users WHERE id = $1 LIMIT 1",
        [userId],
      );
      logger.info("db.users.find_by_id.success", { userId, rowCount: queryResult.rowCount });
      return queryResult.rows[0] ?? null;
    } catch (error) {
      logger.error("db.users.find_by_id.error", error, { userId });
      throw new HttpError(500, "Failed to read user");
    }
  }

  async createUser(email: string, passwordHash: string): Promise<UserRecord> {
    try {
      logger.info("db.users.create.start", { email: email.toLowerCase() });
      const queryResult = await dbPool.query<UserRecord>(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, email, password_hash, role",
        [email.toLowerCase(), passwordHash],
      );
      logger.info("db.users.create.success", { email: email.toLowerCase(), userId: queryResult.rows[0]?.id });
      return queryResult.rows[0];
    } catch (error) {
      logger.error("db.users.create.error", error, { email: email.toLowerCase() });
      throw new HttpError(500, "Failed to create user");
    }
  }
}

export const userRepository = new UserRepository();
