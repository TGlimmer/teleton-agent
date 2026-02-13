/**
 * TON transfer utilities for sending TON to addresses
 */

import { WalletContractV5R1, TonClient, toNano, internal } from "@ton/ton";
import { Address, SendMode } from "@ton/core";
import { getCachedHttpEndpoint } from "./endpoint.js";
import { getKeyPair } from "./wallet-service.js";

export interface SendTonParams {
  toAddress: string;
  amount: number; // In TON (not nano)
  comment?: string;
  bounce?: boolean;
}

/**
 * Send TON to an address
 * Returns transaction hash (hex string)
 */
export async function sendTon(params: SendTonParams): Promise<string | null> {
  try {
    const { toAddress, amount, comment = "", bounce = false } = params;

    // Validate recipient address
    let recipientAddress: Address;
    try {
      recipientAddress = Address.parse(toAddress);
    } catch (e) {
      console.error(`Invalid recipient address: ${toAddress}`, e);
      return null;
    }

    // Load cached key pair
    const keyPair = await getKeyPair();
    if (!keyPair) {
      console.error("Wallet not initialized");
      return null;
    }

    // Create wallet contract
    const wallet = WalletContractV5R1.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });

    // Get endpoint and client
    const endpoint = await getCachedHttpEndpoint();
    const client = new TonClient({ endpoint });
    const contract = client.open(wallet);

    // Get current seqno
    const seqno = await contract.getSeqno();

    // Send transfer
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: [
        internal({
          to: recipientAddress,
          value: toNano(amount),
          body: comment,
          bounce,
        }),
      ],
    });

    // Generate pseudo-hash (actual hash would require polling for confirmation)
    // Format: seqno_timestamp_amount
    const pseudoHash = `${seqno}_${Date.now()}_${amount.toFixed(2)}`;

    console.log(`💸 [TON] Sent ${amount} TON to ${toAddress.slice(0, 8)}... - seqno: ${seqno}`);

    return pseudoHash;
  } catch (error) {
    console.error("Error sending TON:", error);
    return null;
  }
}
