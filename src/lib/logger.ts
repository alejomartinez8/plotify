type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

interface LogContext {
  component?: string;
  function?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return entry;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;

    // In production, only log INFO and above
    const levelPriority = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    return levelPriority[level] >= levelPriority.INFO;
  }

  private output(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    const logFunction =
      entry.level === "ERROR"
        ? console.error
        : entry.level === "WARN"
          ? console.warn
          : console.log;

    if (this.isDevelopment) {
      // Development: readable format
      const contextStr = entry.context
        ? ` [${JSON.stringify(entry.context)}]`
        : "";
      const errorStr = entry.error
        ? `\nError: ${entry.error.message}\n${entry.error.stack}`
        : "";
      logFunction(`[${entry.level}] ${entry.message}${contextStr}${errorStr}`);
    } else {
      // Production/Vercel: structured JSON
      logFunction(JSON.stringify(entry));
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.output(this.formatMessage("ERROR", message, context, error));
  }

  warn(message: string, context?: LogContext) {
    this.output(this.formatMessage("WARN", message, context));
  }

  info(message: string, context?: LogContext) {
    this.output(this.formatMessage("INFO", message, context));
  }

  debug(message: string, context?: LogContext) {
    this.output(this.formatMessage("DEBUG", message, context));
  }

  // Specialized methods for common use cases
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      component: "API",
      type: "request",
    });
  }

  apiResponse(
    method: string,
    path: string,
    status: number,
    duration: number,
    context?: LogContext
  ) {
    const level: LogLevel =
      status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
    this.output(
      this.formatMessage(level, `API Response: ${method} ${path} - ${status}`, {
        ...context,
        component: "API",
        type: "response",
        status,
        duration,
      })
    );
  }

  formSubmission(formType: string, action: string, context?: LogContext) {
    this.info(`Form Submission: ${formType} - ${action}`, {
      ...context,
      component: "Form",
      type: "submission",
    });
  }

  uploadStart(
    fileType: string,
    fileName: string,
    fileSize: number,
    context?: LogContext
  ) {
    this.info(
      `Upload Started: ${fileName} (${fileType}, ${Math.round(fileSize / 1024)}KB)`,
      {
        ...context,
        component: "Upload",
        type: "start",
        fileType,
        fileName,
        fileSize,
      }
    );
  }

  uploadSuccess(
    fileName: string,
    fileId: string,
    duration: number,
    context?: LogContext
  ) {
    this.info(`Upload Success: ${fileName} -> ${fileId}`, {
      ...context,
      component: "Upload",
      type: "success",
      fileName,
      fileId,
      duration,
    });
  }

  uploadError(fileName: string, error: Error, context?: LogContext) {
    this.error(`Upload Failed: ${fileName}`, error, {
      ...context,
      component: "Upload",
      type: "error",
      fileName,
    });
  }

  validation(
    type: "success" | "error",
    field: string,
    value?: any,
    error?: string,
    context?: LogContext
  ) {
    const message = `Validation ${type}: ${field}${error ? ` - ${error}` : ""}`;
    const level: LogLevel = type === "error" ? "WARN" : "DEBUG";

    this.output(
      this.formatMessage(level, message, {
        ...context,
        component: "Validation",
        type,
        field,
        value: this.isDevelopment ? value : "[REDACTED]",
      })
    );
  }

  database(
    operation: string,
    table: string,
    success: boolean,
    duration?: number,
    context?: LogContext
  ) {
    const message = `Database ${operation}: ${table} - ${success ? "SUCCESS" : "FAILED"}`;
    const level: LogLevel = success ? "DEBUG" : "ERROR";

    this.output(
      this.formatMessage(level, message, {
        ...context,
        component: "Database",
        operation,
        table,
        success,
        duration,
      })
    );
  }

  // Performance timing helper
  timer(label: string) {
    const start = Date.now();
    return {
      end: (context?: LogContext) => {
        const duration = Date.now() - start;
        this.debug(`Timer: ${label} completed in ${duration}ms`, {
          ...context,
          duration,
          type: "performance",
        });
        return duration;
      },
    };
  }

  // Request context helper for API routes
  withRequest(req: Request) {
    const requestId = crypto.randomUUID();
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;

    return {
      requestId,
      log: (level: LogLevel, message: string, context?: LogContext) => {
        this.output(
          this.formatMessage(level, message, {
            ...context,
            requestId,
            method,
            path,
          })
        );
      },
      apiRequest: (context?: LogContext) => {
        this.apiRequest(method, path, { ...context, requestId });
      },
      apiResponse: (status: number, duration: number, context?: LogContext) => {
        this.apiResponse(method, path, status, duration, {
          ...context,
          requestId,
        });
      },
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogContext };
