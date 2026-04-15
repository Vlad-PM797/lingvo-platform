interface HttpMetricsSnapshot {
  startedAt: string;
  uptimeSeconds: number;
  requestsTotal: number;
  requestsByStatusClass: {
    status2xx: number;
    status3xx: number;
    status4xx: number;
    status5xx: number;
  };
  latencyMs: {
    avg: number;
    max: number;
  };
}

export class RuntimeMetrics {
  private readonly startedAtDate = new Date();

  private requestsTotal = 0;

  private status2xx = 0;

  private status3xx = 0;

  private status4xx = 0;

  private status5xx = 0;

  private durationTotalMs = 0;

  private durationMaxMs = 0;

  onRequestFinished(statusCode: number, durationMs: number): void {
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

  getSnapshot(): HttpMetricsSnapshot {
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

export const runtimeMetrics = new RuntimeMetrics();
