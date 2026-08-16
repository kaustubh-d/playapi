// 1. Define immutable level hierarchies and strict string literal unions
export const LOG_LEVELS = {
  DEBUG: 1,
  INFO: 2,
  WARNING: 3,
  ERROR: 4,
  FATAL: 5,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export interface LoggerOptions {
  level?: LogLevel;
}

export interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class PlayAPILogger {
  public currentLevel: LogLevel;

  constructor(options: LoggerOptions = {}) {
    // Default to lowest severity (INFO)
    this.currentLevel = options.level || 'INFO';
  }

  // 2. Encapsulated evaluation check
  private _shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.currentLevel];
  }

  // 3. Central execution pipeline
  private _log(level: LogLevel, message: string, context?: unknown): void {
    if (!this._shouldLog(level)) return;

    const timestamp = new Date().toISOString();

    const logPayload: LogPayload = {
      timestamp,
      level,
      message,
    };

    // Safely type-guard incoming context objects or standard Errors
    if (context !== undefined && context !== null) {
      if (context instanceof Error) {
        logPayload.error = {
          name: context.name,
          message: context.message,
          stack: context.stack,
        };
      } else {
        logPayload.context = context;
      }
    }

    const logString = JSON.stringify(logPayload);

    // Direct stderr routing for system failures
    if (level === 'ERROR' || level === 'FATAL') {
      console.error(logString);
    } else {
      console.log(logString);
    }

    // 4. Force termination on FATAL logs
    if (level === 'FATAL') {
      process.exit(1);
    }
  }

  // 5. Explicitly typed public API endpoints
  public debug(msg: string, ctx?: unknown): void { this._log('DEBUG', msg, ctx); }
  public info(msg: string, ctx?: unknown): void { this._log('INFO', msg, ctx); }
  public warn(msg: string, ctx?: unknown): void { this._log('WARNING', msg, ctx); }
  public error(msg: string, ctx?: unknown): void { this._log('ERROR', msg, ctx); }
  public fatal(msg: string, ctx?: unknown): void { this._log('FATAL', msg, ctx); }

  public shouldLogDebug(ctx?: unknown): boolean { return this._shouldLog('DEBUG'); }
}

// Instantiate the singleton instance once
export const logger = new PlayAPILogger({
  // Read level from env vars (e.g. for CI/CD runs) or default to INFO
  level: (process.env.LOG_LEVEL as any) || 'WARNING',
});
