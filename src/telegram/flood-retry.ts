/**
 * FLOOD_WAIT retry wrapper for Telegram MTProto calls.
 *
 * GramJS's built-in floodSleepThreshold handles waits ≤ 60s automatically.
 * This wrapper catches waits > 60s (up to maxWaitSeconds) and retries once.
 */

const DEFAULT_MAX_WAIT_SECONDS = 120;
const DEFAULT_MAX_RETRIES = 2;

/**
 * Execute a Telegram API call with FLOOD_WAIT retry.
 * Parses the wait duration from the error and sleeps accordingly.
 */
export async function withFloodRetry<T>(
  fn: () => Promise<T>,
  maxWaitSeconds = DEFAULT_MAX_WAIT_SECONDS,
  maxRetries = DEFAULT_MAX_RETRIES
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // GramJS FloodWaitError has a .seconds property
      const waitSeconds = (error as any).seconds;

      if (typeof waitSeconds !== "number") {
        throw error; // Not a FLOOD_WAIT — rethrow immediately
      }

      lastError = error as Error;

      if (waitSeconds > maxWaitSeconds) {
        throw new Error(`FLOOD_WAIT ${waitSeconds}s exceeds max ${maxWaitSeconds}s — aborting`);
      }

      if (attempt >= maxRetries) break;

      console.warn(
        `⏳ [FLOOD_WAIT] Waiting ${waitSeconds}s before retry ${attempt + 1}/${maxRetries}`
      );
      await new Promise((r) => setTimeout(r, waitSeconds * 1000));
    }
  }

  throw lastError ?? new Error("FLOOD_WAIT retries exhausted");
}
