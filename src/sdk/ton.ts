/**
 * TonSDK implementation — wraps internal TON services for plugin access.
 */

import type {
  TonSDK,
  TonBalance,
  TonPrice,
  TonSendResult,
  TonTransaction,
  PluginLogger,
} from "./types.js";
import { PluginSDKError } from "./errors.js";
import { getWalletAddress, getWalletBalance, getTonPrice } from "../ton/wallet-service.js";
import { sendTon } from "../ton/transfer.js";

export function createTonSDK(log: PluginLogger): TonSDK {
  return {
    getAddress(): string | null {
      try {
        return getWalletAddress();
      } catch (err) {
        log.error("ton.getAddress() failed:", err);
        return null;
      }
    },

    async getBalance(address?: string): Promise<TonBalance | null> {
      try {
        const addr = address ?? getWalletAddress();
        if (!addr) return null;
        return await getWalletBalance(addr);
      } catch (err) {
        log.error("ton.getBalance() failed:", err);
        return null;
      }
    },

    async getPrice(): Promise<TonPrice | null> {
      try {
        return await getTonPrice();
      } catch (err) {
        log.error("ton.getPrice() failed:", err);
        return null;
      }
    },

    async sendTON(to: string, amount: number, comment?: string): Promise<TonSendResult> {
      const walletAddr = getWalletAddress();
      if (!walletAddr) {
        throw new PluginSDKError("Wallet not initialized", "WALLET_NOT_INITIALIZED");
      }

      // Validate amount
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new PluginSDKError("Amount must be a positive number", "OPERATION_FAILED");
      }

      // Validate address format before attempting transfer
      try {
        const { Address } = await import("@ton/core");
        Address.parse(to);
      } catch {
        throw new PluginSDKError("Invalid TON address format", "INVALID_ADDRESS");
      }

      try {
        const txRef = await sendTon({
          toAddress: to,
          amount,
          comment,
          bounce: false,
        });

        if (!txRef) {
          throw new PluginSDKError(
            "Transaction failed — no reference returned",
            "OPERATION_FAILED"
          );
        }

        return { txRef, amount };
      } catch (err) {
        if (err instanceof PluginSDKError) throw err;
        throw new PluginSDKError(
          `Failed to send TON: ${err instanceof Error ? err.message : String(err)}`,
          "OPERATION_FAILED"
        );
      }
    },

    async getTransactions(address: string, limit?: number): Promise<TonTransaction[]> {
      try {
        const { TonClient } = await import("@ton/ton");
        const { Address } = await import("@ton/core");
        const { getCachedHttpEndpoint } = await import("../ton/endpoint.js");
        const { formatTransactions } = await import("../ton/format-transactions.js");

        const addressObj = Address.parse(address);
        const endpoint = await getCachedHttpEndpoint();
        const client = new TonClient({ endpoint });

        const transactions = await client.getTransactions(addressObj, {
          limit: Math.min(limit ?? 10, 50),
        });

        return formatTransactions(transactions);
      } catch (err) {
        log.error("ton.getTransactions() failed:", err);
        return [];
      }
    },
  };
}
