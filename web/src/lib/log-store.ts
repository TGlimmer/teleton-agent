import { api } from './api';

export interface LogEntry {
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

type Listener = () => void;

const MAX_LOGS = 2000;

class LogStore {
  private logs: LogEntry[] = [];
  private snapshot: LogEntry[] = [];
  private listeners = new Set<Listener>();
  private disconnect: (() => void) | null = null;
  private connected = false;

  connect() {
    if (this.disconnect) return;

    this.disconnect = api.connectLogs(
      (entry) => {
        this.logs.push(entry);
        if (this.logs.length > MAX_LOGS) {
          this.logs = this.logs.slice(-MAX_LOGS);
        }
        this.connected = true;
        this.snapshot = [...this.logs]; // new reference for React
        this.notify();
      },
      () => {
        this.connected = false;
        if (this.disconnect) {
          this.disconnect(); // Close old EventSource before allowing reconnect
          this.disconnect = null;
        }
        this.notify();
      }
    );
  }

  getLogs(): LogEntry[] {
    return this.snapshot;
  }

  isConnected(): boolean {
    return this.connected;
  }

  clear() {
    this.logs = [];
    this.snapshot = [];
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }
}

// Singleton — survives across route changes
export const logStore = new LogStore();
