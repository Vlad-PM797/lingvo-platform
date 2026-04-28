import { dbPool } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

interface TouchActivityInput {
  userId: string;
  ipAddress: string;
  userAgent: string;
  origin: string;
  requestPath: string;
}

interface TesterActivityRow {
  email: string;
  user_id: string;
  ip_address: string;
  origin: string;
  user_agent: string;
  first_seen_at: string;
  last_seen_at: string;
  total_requests: number;
  duration_seconds: number;
}

const QUERY_TOUCH_ACTIVITY = `
  INSERT INTO tester_activity (
    user_id, activity_date, ip_address, user_agent, origin, last_path, request_count, first_seen_at, last_seen_at, updated_at
  )
  VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, 1, NOW(), NOW(), NOW())
  ON CONFLICT (user_id, activity_date, ip_address, user_agent)
  DO UPDATE SET
    request_count = tester_activity.request_count + 1,
    origin = EXCLUDED.origin,
    last_path = EXCLUDED.last_path,
    last_seen_at = NOW(),
    updated_at = NOW()
`;

const QUERY_GET_ACTIVITY_REPORT = `
  SELECT
    u.email,
    ta.user_id,
    ta.ip_address,
    ta.origin,
    ta.user_agent,
    MIN(ta.first_seen_at)::timestamptz AS first_seen_at,
    MAX(ta.last_seen_at)::timestamptz AS last_seen_at,
    SUM(ta.request_count)::int AS total_requests,
    GREATEST(0, EXTRACT(EPOCH FROM (MAX(ta.last_seen_at) - MIN(ta.first_seen_at))))::int AS duration_seconds
  FROM tester_activity ta
  INNER JOIN users u ON u.id = ta.user_id
  WHERE ta.last_seen_at >= NOW() - ($1::int * INTERVAL '1 hour')
  GROUP BY u.email, ta.user_id, ta.ip_address, ta.origin, ta.user_agent
  ORDER BY MAX(ta.last_seen_at) DESC
  LIMIT $2
`;

export class TesterActivityRepository {
  async touchActivity(input: TouchActivityInput): Promise<void> {
    try {
      logger.info("db.tester_activity.touch.start", { userId: input.userId, ipAddress: input.ipAddress });
      await dbPool.query(QUERY_TOUCH_ACTIVITY, [
        input.userId,
        input.ipAddress,
        input.userAgent,
        input.origin,
        input.requestPath,
      ]);
      logger.info("db.tester_activity.touch.success", { userId: input.userId, ipAddress: input.ipAddress });
    } catch (error) {
      logger.error("db.tester_activity.touch.error", error, { userId: input.userId, ipAddress: input.ipAddress });
      throw new HttpError(500, "Failed to save tester activity");
    }
  }

  async getActivityReport(hours: number, limit: number): Promise<TesterActivityRow[]> {
    try {
      logger.info("db.tester_activity.report.start", { hours, limit });
      const result = await dbPool.query<TesterActivityRow>(QUERY_GET_ACTIVITY_REPORT, [hours, limit]);
      logger.info("db.tester_activity.report.success", { rowCount: result.rowCount });
      return result.rows;
    } catch (error) {
      logger.error("db.tester_activity.report.error", error, { hours, limit });
      throw new HttpError(500, "Failed to read tester activity");
    }
  }
}

export const testerActivityRepository = new TesterActivityRepository();
