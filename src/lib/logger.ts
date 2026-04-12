interface LogContext {
  requestId?: string;
  userId?: string;
  email?: string;
  operation?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context?: LogContext;
  error?: any;
  duration?: number;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private enableDebugInProduction = process.env.ENABLE_DEBUG_LOGS === 'true';

  private formatLog(entry: LogEntry): string {
    const contextStr = entry.context ? JSON.stringify(entry.context) : '';
    const errorStr = entry.error ? JSON.stringify(entry.error, Object.getOwnPropertyNames(entry.error)) : '';
    const durationStr = entry.duration !== undefined ? ` [${entry.duration}ms]` : '';

    return `[${entry.timestamp}] ${entry.level}: ${entry.message}${durationStr} ${contextStr} ${errorStr}`.trim();
  }

  protected log(level: LogEntry['level'], message: string, context?: LogContext, error?: any, duration?: number): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      duration
    };

    // In production, emit ERROR and WARN as structured JSON so CloudWatch
    // metric filters can match on the `level` field for alerting.
    const isStructured = !this.isDevelopment && (level === 'ERROR' || level === 'WARN');
    const output = isStructured
      ? JSON.stringify({
          timestamp: entry.timestamp,
          level: entry.level,
          message: entry.message,
          ...(entry.context && { context: entry.context }),
          ...(entry.duration !== undefined && { duration: entry.duration }),
          ...(entry.error && { error: JSON.parse(JSON.stringify(entry.error, Object.getOwnPropertyNames(entry.error))) }),
        })
      : this.formatLog(entry);

    switch (level) {
      case 'ERROR':
        console.error(output);
        break;
      case 'WARN':
        console.warn(output);
        break;
      case 'DEBUG':
        if (this.isDevelopment || this.enableDebugInProduction) {
          console.log(output);
        }
        break;
      default:
        console.log(output);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: LogContext, error?: any): void {
    this.log('WARN', message, context, error);
  }

  error(message: string, context?: LogContext, error?: any): void {
    this.log('ERROR', message, context, error);
  }

  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', message, context);
  }

  async time<T>(operation: string, fn: () => Promise<T>, context?: LogContext): Promise<T> {
    const startTime = Date.now();
    this.debug(`Starting operation: ${operation}`, context);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.info(`Operation completed: ${operation}`, { ...context, duration });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`Operation failed: ${operation}`, { ...context, duration }, error);
      throw error;
    }
  }

  withContext(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);

    childLogger.log = (level, message, additionalContext, error, duration) => {
      const mergedContext = { ...context, ...additionalContext };
      originalLog(level, message, mergedContext, error, duration);
    };

    return childLogger;
  }

  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const logger = new Logger();
