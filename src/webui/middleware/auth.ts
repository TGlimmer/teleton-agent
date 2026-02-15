import { bearerAuth } from "hono/bearer-auth";
import { randomBytes } from "node:crypto";

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function createAuthMiddleware(token: string) {
  return bearerAuth({ token });
}
