import type { LogEntry } from "./types.js";

type LogListener = (entry: LogEntry) => void;

class LogInterceptor {
  private listeners = new Set<LogListener>();
  private isPatched = false;
  private originalMethods = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  install(): void {
    if (this.isPatched) return;

    const levels: Array<"log" | "warn" | "error"> = ["log", "warn", "error"];

    for (const level of levels) {
      const original = this.originalMethods[level];
      console[level] = (...args: unknown[]) => {
        // Call original first (preserve normal logging)
        original.apply(console, args);

        // Emit to listeners
        if (this.listeners.size > 0) {
          const entry: LogEntry = {
            level,
            message: args
              .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
              .join(" "),
            timestamp: Date.now(),
          };

          for (const listener of this.listeners) {
            try {
              listener(entry);
            } catch (err) {
              // Don't let listener errors break logging
              original.call(console, "❌ Log listener error:", err);
            }
          }
        }
      };
    }

    this.isPatched = true;
  }

  uninstall(): void {
    if (!this.isPatched) return;

    console.log = this.originalMethods.log;
    console.warn = this.originalMethods.warn;
    console.error = this.originalMethods.error;

    this.isPatched = false;
  }

  addListener(listener: LogListener): () => void {
    this.listeners.add(listener);
    // Return cleanup function
    return () => this.listeners.delete(listener);
  }

  removeListener(listener: LogListener): void {
    this.listeners.delete(listener);
  }

  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
export const logInterceptor = new LogInterceptor();
