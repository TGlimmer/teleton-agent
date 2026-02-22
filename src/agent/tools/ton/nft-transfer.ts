import { Type } from "@sinclair/typebox";
import type { Tool, ToolExecutor, ToolResult } from "../types.js";
import { loadWallet, getKeyPair } from "../../../ton/wallet-service.js";
import { WalletContractV5R1, TonClient, toNano, internal } from "@ton/ton";
import { Address, SendMode, beginCell } from "@ton/core";
import { getCachedHttpEndpoint } from "../../../ton/endpoint.js";
import { tonapiFetch } from "../../../constants/api-endpoints.js";
import { getErrorMessage } from "../../../utils/errors.js";
import { createLogger } from "../../../utils/logger.js";

const log = createLogger("Tools");

// NFT transfer op code (TEP-62)
const NFT_TRANSFER_OP = 0x5fcc3d14;

interface NftTransferParams {
  nft_address: string;
  to: string;
  comment?: string;
}

export const nftTransferTool: Tool = {
  name: "nft_transfer",
  description:
    "Transfer an NFT to another TON address. Verifies ownership before sending. Use nft_list or nft_detail first to find the NFT address.",
  parameters: Type.Object({
    nft_address: Type.String({
      description: "NFT item contract address to transfer (EQ... or 0:... format)",
    }),
    to: Type.String({
      description: "Recipient TON address (EQ... or UQ... format)",
    }),
    comment: Type.Optional(
      Type.String({
        description: "Optional comment/memo to include with the transfer notification",
      })
    ),
  }),
};

export const nftTransferExecutor: ToolExecutor<NftTransferParams> = async (
  params,
  _context
): Promise<ToolResult> => {
  try {
    const { nft_address, to, comment } = params;

    // 1. Verify wallet is initialized
    const walletData = loadWallet();
    if (!walletData) {
      return {
        success: false,
        error: "Wallet not initialized. Contact admin to generate wallet.",
      };
    }

    // 2. Validate recipient address
    try {
      Address.parse(to);
    } catch {
      return { success: false, error: `Invalid recipient address: ${to}` };
    }

    // 3. Validate NFT address
    try {
      Address.parse(nft_address);
    } catch {
      return { success: false, error: `Invalid NFT address: ${nft_address}` };
    }

    // 4. Verify ownership via TonAPI
    const nftRes = await tonapiFetch(`/nfts/${encodeURIComponent(nft_address)}`);
    if (nftRes.status === 404) {
      return { success: false, error: `NFT not found: ${nft_address}` };
    }
    if (!nftRes.ok) {
      return {
        success: false,
        error: `Failed to verify NFT ownership: TonAPI ${nftRes.status}`,
      };
    }

    const nftData = await nftRes.json();
    const nftName = nftData.metadata?.name || "NFT";
    const currentOwner = nftData.owner?.address;

    if (!currentOwner) {
      return { success: false, error: "Could not determine NFT owner." };
    }

    // Normalize addresses for comparison (handles bounceable/non-bounceable)
    const normalizedOwner = Address.parse(currentOwner).toString();
    const normalizedWallet = Address.parse(walletData.address).toString();

    if (normalizedOwner !== normalizedWallet) {
      return {
        success: false,
        error: `You don't own this NFT. Current owner: ${currentOwner}`,
      };
    }

    // 5. Build forward payload (comment)
    let forwardPayload = beginCell().endCell();
    if (comment) {
      forwardPayload = beginCell()
        .storeUint(0, 32) // text comment op code
        .storeStringTail(comment)
        .endCell();
    }

    // 6. Build NFT transfer message body (TEP-62)
    const messageBody = beginCell()
      .storeUint(NFT_TRANSFER_OP, 32) // op: transfer
      .storeUint(0, 64) // query_id
      .storeAddress(Address.parse(to)) // new_owner
      .storeAddress(Address.parse(walletData.address)) // response_destination
      .storeBit(false) // no custom_payload
      .storeCoins(comment ? toNano("0.01") : BigInt(1)) // forward_amount
      .storeBit(comment ? true : false) // forward_payload flag
      .storeMaybeRef(comment ? forwardPayload : null) // forward_payload
      .endCell();

    // 7. Derive keys and send transaction
    const keyPair = await getKeyPair();
    if (!keyPair) {
      return { success: false, error: "Wallet key derivation failed." };
    }

    const wallet = WalletContractV5R1.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });

    const endpoint = await getCachedHttpEndpoint();
    const client = new TonClient({ endpoint });
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    // Send TO the NFT contract (not to recipient!)
    await walletContract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: [
        internal({
          to: Address.parse(nft_address),
          value: toNano("0.05"), // Gas for NFT transfer
          body: messageBody,
          bounce: true,
        }),
      ],
    });

    return {
      success: true,
      data: {
        nftAddress: nft_address,
        nftName,
        to,
        from: walletData.address,
        comment: comment || null,
        message: `Transferred NFT "${nftName}" to ${to}${comment ? ` (${comment})` : ""}\nTransaction sent (check in ~30 seconds)`,
      },
    };
  } catch (error) {
    log.error({ err: error }, "Error in nft_transfer");
    return { success: false, error: getErrorMessage(error) };
  }
};
