import { Pool } from "pg";
import { env } from "./config/env";
import { logger } from "./utils/logger";

export const dbPool = new Pool({
  connectionString: env.databaseUrl,
});

dbPool.on("error", (error) => {
  logger.error("database.pool.error", error);
});

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await dbPool.query("SELECT 1");
    return true;
  } catch (error) {
    logger.error("database.health.failed", error);
    return false;
  }
}

export async function closeDatabasePool(): Promise<void> {
  await dbPool.end();
}
