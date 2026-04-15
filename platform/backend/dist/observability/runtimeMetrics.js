"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtimeMetrics = exports.RuntimeMetrics = void 0;
class RuntimeMetrics {
    startedAtDate = new Date();
    requestsTotal = 0;
    status2xx = 0;
    status3xx = 0;
    status4xx = 0;
    status5xx = 0;
    durationTotalMs = 0;
    durationMaxMs = 0;
    onRequestFinished(statusCode, durationMs) {
        this.requestsTotal += 1;
        this.durationTotalMs += durationMs;
        this.durationMaxMs = Math.max(this.durationMaxMs, durationMs);
        if (statusCode >= 200 && statusCode < 300) {
            this.status2xx += 1;
            return;
        }
        if (statusCode >= 300 && statusCode < 400) {
            this.status3xx += 1;
            return;
        }
        if (statusCode >= 400 && statusCode < 500) {
            this.status4xx += 1;
            return;
        }
        if (statusCode >= 500) {
            this.status5xx += 1;
        }
    }
    getSnapshot() {
        const uptimeSeconds = Math.floor((Date.now() - this.startedAtDate.getTime()) / 1000);
        const avgLatencyMs = this.requestsTotal === 0 ? 0 : Number((this.durationTotalMs / this.requestsTotal).toFixed(2));
        return {
            startedAt: this.startedAtDate.toISOString(),
            uptimeSeconds,
            requestsTotal: this.requestsTotal,
            requestsByStatusClass: {
                status2xx: this.status2xx,
                status3xx: this.status3xx,
                status4xx: this.status4xx,
                status5xx: this.status5xx,
            },
            latencyMs: {
                avg: avgLatencyMs,
                max: this.durationMaxMs,
            },
        };
    }
}
exports.RuntimeMetrics = RuntimeMetrics;
exports.runtimeMetrics = new RuntimeMetrics();
