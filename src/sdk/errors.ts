/**
 * Plugin SDK error types.
 *
 * Plugins can switch on `error.code` for programmatic error handling.
 *
 * @module @tonnet/sdk
 */

/**
 * Error codes produced by SDK methods.
 */
export type SDKErrorCode =
  | "BRIDGE_NOT_CONNECTED"
  | "WALLET_NOT_INITIALIZED"
  | "INVALID_ADDRESS"
  | "OPERATION_FAILED";

/**
 * Typed error thrown by SDK action methods (sendTON, sendMessage, sendDice).
 *
 * Read methods (getBalance, getPrice, getTransactions) return null or []
 * instead of throwing.
 *
 * @example
 * ```typescript
 * try {
 *   await sdk.ton.sendTON(address, 1.0);
 * } catch (err) {
 *   if (err instanceof PluginSDKError && err.code === "WALLET_NOT_INITIALIZED") {
 *     // handle missing wallet
 *   }
 * }
 * ```
 */
export class PluginSDKError extends Error {
  public readonly name = "PluginSDKError" as const;

  constructor(
    message: string,
    public readonly code: SDKErrorCode
  ) {
    super(message);
  }
}
