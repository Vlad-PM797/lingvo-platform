export class Logger {
  info(operation: string, payload: Record<string, unknown> = {}): void {
    console.info(
      JSON.stringify({
        level: "info",
        operation,
        payload,
        at: new Date().toISOString(),
      }),
    );
  }

  error(operation: string, error: unknown, payload: Record<string, unknown> = {}): void {
    console.error(
      JSON.stringify({
        level: "error",
        operation,
        payload,
        message: error instanceof Error ? error.message : String(error),
        at: new Date().toISOString(),
      }),
    );
  }
}

export const logger = new Logger();
