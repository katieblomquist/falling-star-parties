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

  private formatLog(entry: LogEntry): string {
    const contextStr = entry.context ? JSON.stringify(entry.context) : '';
    const errorStr = entry.error ? JSON.stringify(entry.error, Object.getOwnPropertyNames(entry.error)) : '';
    const durationStr = entry.duration !== undefined ? ` [${entry.duration}ms]` : '';
    
    return `[${entry.timestamp}] ${entry.level}: ${entry.message}${durationStr} ${contextStr} ${errorStr}`.trim();
  }

  private log(level: LogEntry['level'], message: string, context?: LogContext, error?: any, duration?: number): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      duration
    };

    const formattedLog = this.formatLog(entry);

    // Console output
    switch (level) {
      case 'ERROR':
        console.error(formattedLog);
        break;
      case 'WARN':
        console.warn(formattedLog);
        break;
      case 'DEBUG':
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
      default:
        console.log(formattedLog);
    }

    // In production, you might want to send logs to external service
    // Example: await this.sendToExternalLoggingService(entry);
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

  // Utility for timing operations
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

  // Create a child logger with preset context
  withContext(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level, message, additionalContext, error, duration) => {
      const mergedContext = { ...context, ...additionalContext };
      originalLog(level, message, mergedContext, error, duration);
    };
    
    return childLogger;
  }

  // Generate request ID for tracking
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const logger = new Logger();