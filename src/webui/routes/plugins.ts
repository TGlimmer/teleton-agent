import { Hono } from "hono";
import type { WebUIServerDeps, APIResponse, LoadedPlugin } from "../types.js";

export function createPluginsRoutes(deps: WebUIServerDeps) {
  const app = new Hono();

  // List all loaded plugins
  app.get("/", (c) => {
    const response: APIResponse<LoadedPlugin[]> = {
      success: true,
      data: deps.plugins,
    };
    return c.json(response);
  });

  return app;
}
