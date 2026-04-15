import { Request, Response } from "express";
import { checkDatabaseHealth } from "../db";
import { runtimeMetrics } from "../observability/runtimeMetrics";

export class HealthController {
  async getHealth(_request: Request, response: Response): Promise<void> {
    const dbOk = await checkDatabaseHealth();
    response.status(dbOk ? 200 : 503).json({
      status: dbOk ? "ok" : "degraded",
      database: dbOk ? "up" : "down",
      at: new Date().toISOString(),
    });
  }

  async getLiveness(_request: Request, response: Response): Promise<void> {
    response.status(200).json({
      status: "alive",
      at: new Date().toISOString(),
    });
  }

  async getReadiness(_request: Request, response: Response): Promise<void> {
    const dbOk = await checkDatabaseHealth();
    response.status(dbOk ? 200 : 503).json({
      status: dbOk ? "ready" : "not_ready",
      checks: {
        database: dbOk ? "up" : "down",
      },
      at: new Date().toISOString(),
    });
  }

  async getMetrics(_request: Request, response: Response): Promise<void> {
    response.status(200).json({
      service: "lingvo-backend",
      metrics: runtimeMetrics.getSnapshot(),
      at: new Date().toISOString(),
    });
  }
}

export const healthController = new HealthController();
