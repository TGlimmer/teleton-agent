import type { AgentRuntime } from "../agent/runtime.js";
import type { TelegramBridge } from "../telegram/bridge.js";
import type { MemorySystem } from "../memory/index.js";
import type { ToolRegistry } from "../agent/tools/registry.js";
import type { WebUIConfig } from "../config/schema.js";
import type { Database } from "better-sqlite3";

export interface LoadedPlugin {
  name: string;
  version: string;
}

export interface WebUIServerDeps {
  agent: AgentRuntime;
  bridge: TelegramBridge;
  memory: {
    db: Database;
    embedder: MemorySystem["embedder"];
    knowledge: MemorySystem["knowledge"];
  };
  toolRegistry: ToolRegistry;
  plugins: LoadedPlugin[];
  config: WebUIConfig;
}

export interface LogEntry {
  level: "log" | "warn" | "error";
  message: string;
  timestamp: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StatusResponse {
  uptime: number;
  model: string;
  provider: string;
  sessionCount: number;
  paused: boolean;
  toolCount: number;
}

export interface ToolInfo {
  name: string;
  description: string;
  module: string;
  scope: "always" | "dm-only" | "group-only" | "admin-only";
  category?: string;
  enabled: boolean;
}

export interface ModuleInfo {
  name: string;
  toolCount: number;
  tools: ToolInfo[];
  isPlugin: boolean;
}

export interface PluginManifest {
  name: string;
  version: string;
  author?: string;
  description?: string;
  dependencies?: string[];
  sdkVersion?: string;
}

export interface MemorySearchResult {
  id: string;
  text: string;
  source: string;
  score: number;
  vectorScore?: number;
  keywordScore?: number;
}

export interface SessionInfo {
  chatId: string;
  sessionId: string;
  messageCount: number;
  contextTokens: number;
  lastActivity: number;
}
