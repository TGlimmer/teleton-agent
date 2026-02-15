import { Hono } from "hono";
import type { WebUIServerDeps, MemorySearchResult, SessionInfo, APIResponse } from "../types.js";

export function createMemoryRoutes(deps: WebUIServerDeps) {
  const app = new Hono();

  // Search knowledge base
  app.get("/search", async (c) => {
    try {
      const query = c.req.query("q") || "";
      const limit = parseInt(c.req.query("limit") || "10", 10);

      if (!query) {
        const response: APIResponse = {
          success: false,
          error: "Query parameter 'q' is required",
        };
        return c.json(response, 400);
      }

      // Perform keyword search (FTS5) - we don't have direct access to hybrid search here
      // but we can query the FTS table directly
      const results = deps.memory.db
        .prepare(
          `
          SELECT
            k.id,
            k.text,
            k.source,
            k.path,
            bm25(knowledge_fts) as score
          FROM knowledge_fts
          JOIN knowledge k ON knowledge_fts.rowid = k.rowid
          WHERE knowledge_fts MATCH ?
          ORDER BY score DESC
          LIMIT ?
        `
        )
        .all(query, limit) as Array<{
        id: string;
        text: string;
        source: string;
        path: string | null;
        score: number;
      }>;

      const searchResults: MemorySearchResult[] = results.map((row) => ({
        id: row.id,
        text: row.text,
        source: row.path || row.source,
        score: Math.max(0, 1 - row.score / 10), // Normalize BM25 score to 0-1 range
        keywordScore: Math.max(0, 1 - row.score / 10),
      }));

      const response: APIResponse<MemorySearchResult[]> = {
        success: true,
        data: searchResults,
      };

      return c.json(response);
    } catch (error) {
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
      return c.json(response, 500);
    }
  });

  // Get active sessions
  app.get("/sessions", (c) => {
    try {
      const rows = deps.memory.db
        .prepare(
          `
          SELECT
            chat_id,
            session_id,
            message_count,
            context_tokens,
            last_activity
          FROM sessions
          ORDER BY last_activity DESC
        `
        )
        .all() as Array<{
        chat_id: string;
        session_id: string;
        message_count: number;
        context_tokens: number;
        last_activity: number;
      }>;

      const sessions: SessionInfo[] = rows.map((row) => ({
        chatId: row.chat_id,
        sessionId: row.session_id,
        messageCount: row.message_count,
        contextTokens: row.context_tokens,
        lastActivity: row.last_activity,
      }));

      const response: APIResponse<SessionInfo[]> = {
        success: true,
        data: sessions,
      };

      return c.json(response);
    } catch (error) {
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
      return c.json(response, 500);
    }
  });

  // Get memory stats
  app.get("/stats", (c) => {
    try {
      const stats = {
        knowledge: (
          deps.memory.db.prepare("SELECT COUNT(*) as count FROM knowledge").get() as {
            count: number;
          }
        ).count,
        sessions: (
          deps.memory.db.prepare("SELECT COUNT(*) as count FROM sessions").get() as {
            count: number;
          }
        ).count,
        messages: (
          deps.memory.db.prepare("SELECT COUNT(*) as count FROM tg_messages").get() as {
            count: number;
          }
        ).count,
        chats: (
          deps.memory.db.prepare("SELECT COUNT(*) as count FROM tg_chats").get() as {
            count: number;
          }
        ).count,
      };

      const response: APIResponse<typeof stats> = {
        success: true,
        data: stats,
      };

      return c.json(response);
    } catch (error) {
      const response: APIResponse = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
      return c.json(response, 500);
    }
  });

  return app;
}
