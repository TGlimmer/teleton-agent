import { Type } from "@sinclair/typebox";
import type { Tool, ToolExecutor, ToolResult } from "../types.js";
import { tonapiFetch } from "../../../constants/api-endpoints.js";
import { getErrorMessage } from "../../../utils/errors.js";
import { createLogger } from "../../../utils/logger.js";
import { mapNftItemSummary } from "./nft-utils.js";

const log = createLogger("Tools");

interface NftCollectionItemsParams {
  collection_address: string;
  limit?: number;
  offset?: number;
}

export const nftCollectionItemsTool: Tool = {
  name: "nft_collection_items",
  description:
    "Browse NFT items in a collection on TON with pagination. Returns basic info for each item including name, owner, sale status, and preview.",
  parameters: Type.Object({
    collection_address: Type.String({
      description: "NFT collection contract address (EQ... or 0:... format)",
    }),
    limit: Type.Optional(
      Type.Number({
        description: "Max items to return (1-100). Defaults to 20.",
        minimum: 1,
        maximum: 100,
      })
    ),
    offset: Type.Optional(
      Type.Number({
        description: "Offset for pagination. Defaults to 0.",
        minimum: 0,
      })
    ),
  }),
  category: "data-bearing",
};

export const nftCollectionItemsExecutor: ToolExecutor<NftCollectionItemsParams> = async (
  params,
  _context
): Promise<ToolResult> => {
  try {
    const { collection_address } = params;
    const limit = params.limit || 20;
    const offset = params.offset || 0;

    const res = await tonapiFetch(
      `/nfts/collections/${encodeURIComponent(collection_address)}/items?limit=${limit}&offset=${offset}`
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
    if (!Array.isArray(data.nft_items)) {
      return { success: false, error: "Invalid API response: missing nft_items array" };
    }

    // Filter out blacklisted NFTs
    const filtered = data.nft_items.filter((item: any) => item.trust !== "blacklist");
    const items = filtered.map(mapNftItemSummary);

    const hasMore = data.nft_items.length >= limit;
    const onSaleCount = items.filter((n: any) => n.onSale).length;

    const message = `Found ${items.length} item(s) in collection (offset ${offset}).${hasMore ? " More items available." : ""}${onSaleCount > 0 ? ` ${onSaleCount} on sale.` : ""}`;

    return {
      success: true,
      data: {
        collectionAddress: collection_address,
        totalReturned: items.length,
        offset,
        hasMore,
        items,
        message,
      },
    };
  } catch (error) {
    log.error({ err: error }, "Error in nft_collection_items");
    return { success: false, error: getErrorMessage(error) };
  }
};
