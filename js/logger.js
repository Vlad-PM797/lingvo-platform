import { APP_CONFIG } from "./config.js";

export class AppLogger {
  info(operationName, payload = {}) {
    if (!APP_CONFIG.TELEMETRY_ENABLED) {
      return;
    }

    console.info(`[INFO] ${operationName}`, payload);
  }

  error(operationName, error, payload = {}) {
    if (!APP_CONFIG.TELEMETRY_ENABLED) {
      return;
    }

    console.error(`[ERROR] ${operationName}`, {
      message: error instanceof Error ? error.message : String(error),
      payload,
    });
  }
}
