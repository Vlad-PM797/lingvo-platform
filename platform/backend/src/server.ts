import { buildApp } from "./app";
import { env } from "./config/env";
import { closeDatabasePool } from "./db";
import { logger } from "./utils/logger";
import { Server } from "http";

let serverInstance: Server | null = null;
let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  logger.info("server.shutdown.started", { signal });

  try {
    await new Promise<void>((resolve, reject) => {
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
    await closeDatabasePool();
    logger.info("server.shutdown.completed");
    process.exit(0);
  } catch (error) {
    logger.error("server.shutdown.failed", error);
    process.exit(1);
  }
}

async function start(): Promise<void> {
  try {
    const app = buildApp();
    serverInstance = app.listen(env.port, () => {
      logger.info("server.started", { port: env.port, nodeEnv: env.nodeEnv });
    });
  } catch (error) {
    logger.error("server.start.failed", error);
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
  logger.error("process.unhandled_rejection", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("process.uncaught_exception", error);
});

void start();
