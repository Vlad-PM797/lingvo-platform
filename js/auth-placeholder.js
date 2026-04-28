import { APP_CONFIG } from "./config.js";

export class AuthExtensionService {
  constructor(logger) {
    this.logger = logger;
  }

  isEnabled() {
    return APP_CONFIG.AUTH_ENABLED;
  }

  ensureSession() {
    try {
      this.logger.info("auth.ensureSession.attempt", { enabled: this.isEnabled() });
      if (!this.isEnabled()) {
        return { isAuthenticated: true, mode: "guest" };
      }

      return { isAuthenticated: false, mode: "disabled-feature" };
    } catch (error) {
      this.logger.error("auth.ensureSession.failed", error);
      return { isAuthenticated: true, mode: "guest-fallback" };
    }
  }
}
