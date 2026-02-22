import { Type } from "@sinclair/typebox";
import type { Tool, ToolExecutor, ToolResult } from "../types.js";
import { tonapiFetch } from "../../../constants/api-endpoints.js";
import { getWalletAddress } from "../../../ton/wallet-service.js";
import { getErrorMessage } from "../../../utils/errors.js";
import { createLogger } from "../../../utils/logger.js";
import { mapNftItemSummary, type NftItemSummary } from "./nft-utils.js";

const log = createLogger("Tools");

interface NftOnSaleParams {
  collection_address?: string;
  owner_address?: string;
  limit?: number;
}

export const nftOnSaleTool: Tool = {
  name: "nft_on_sale",
  description:
    "Find NFTs currently listed for sale. Search by collection address, wallet address, or both. Returns items sorted by price (cheapest first).",
  parameters: Type.Object({
    collection_address: Type.Optional(
      Type.String({
        description: "NFT collection contract address to search for items on sale.",
      })
    ),
    owner_address: Type.Optional(
      Type.String({
        description:
          "Wallet address to find their NFTs currently on sale. Defaults to agent's wallet if neither address is provided.",
      })
    ),
    limit: Type.Optional(
      Type.Number({
        description: "Max items to return (1-50). Defaults to 20.",
        minimum: 1,
        maximum: 50,
      })
    ),
  }),
  category: "data-bearing",
};

export const nftOnSaleExecutor: ToolExecutor<NftOnSaleParams> = async (
  params,
  _context
): Promise<ToolResult> => {
  try {
    const limit = params.limit || 20;
    let { collection_address, owner_address } = params;

    // If neither provided, default to agent's own wallet
    if (!collection_address && !owner_address) {
      owner_address = getWalletAddress() || undefined;
      if (!owner_address) {
        return {
          success: false,
          error: "Provide collection_address or owner_address. Agent wallet is not initialized.",
        };
      }
    }

    let rawItems: any[] = [];

    if (collection_address) {
      // Fetch a larger batch from collection to find enough on-sale items
      const fetchLimit = Math.min(limit * 10, 1000);
      const res = await tonapiFetch(
        `/nfts/collections/${encodeURIComponent(collection_address)}/items?limit=${fetchLimit}`
      );
      if (res.status === 404) {
        return { success: false, error: `Collection not found: ${collection_address}` };
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
          success: false,
          error: `TonAPI error ${res.status}: ${text || res.statusText}`,
        };
      }
      const data = await res.json();
      rawItems = data.nft_items || [];

      // If owner_address also provided, filter by owner
      if (owner_address) {
        rawItems = rawItems.filter((item: any) => item.owner?.address === owner_address);
      }
    } else if (owner_address) {
      const res = await tonapiFetch(
        `/accounts/${encodeURIComponent(owner_address)}/nfts?limit=100&indirect_ownership=true`
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
          success: false,
          error: `TonAPI error ${res.status}: ${text || res.statusText}`,
        };
      }
      const data = await res.json();
      rawItems = data.nft_items || [];
    }

    // Filter for items on sale, exclude blacklisted
    const onSaleItems = rawItems.filter((item: any) => item.sale && item.trust !== "blacklist");

    // Map and sort by price ascending
    const mapped: NftItemSummary[] = onSaleItems.map(mapNftItemSummary);
    mapped.sort((a, b) => {
      const priceA = parsePriceNumber(a.salePrice);
      const priceB = parsePriceNumber(b.salePrice);
      return priceA - priceB;
    });

    const items = mapped.slice(0, limit);

    const message = `Found ${onSaleItems.length} NFT(s) on sale${collection_address ? ` in collection` : ""}${owner_address ? ` for wallet ${owner_address.slice(0, 12)}...` : ""}. Showing ${items.length} (cheapest first).`;

    return {
      success: true,
      data: {
        totalOnSale: onSaleItems.length,
        returned: items.length,
        items,
        message,
      },
    };
  } catch (error) {
    log.error({ err: error }, "Error in nft_on_sale");
    return { success: false, error: getErrorMessage(error) };
  }
};

/** Parse a price string like "5.5 TON" to a number for sorting */
function parsePriceNumber(price: string | null): number {
  if (!price) return Infinity;
  const num = parseFloat(price);
  return isNaN(num) ? Infinity : num;
}
