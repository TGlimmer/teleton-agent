import { Type } from "@sinclair/typebox";
import type { Tool, ToolExecutor, ToolResult } from "../types.js";
import { tonapiFetch } from "../../../constants/api-endpoints.js";
import { getErrorMessage } from "../../../utils/errors.js";
import { createLogger } from "../../../utils/logger.js";
import { pickPreview, formatSalePrice } from "./nft-utils.js";

const log = createLogger("Tools");

interface NftDetailParams {
  nft_address: string;
}

export const nftDetailTool: Tool = {
  name: "nft_detail",
  description:
    "Get detailed information about a specific NFT item on TON, including metadata, attributes/traits, owner, collection, sale status, and preview images.",
  parameters: Type.Object({
    nft_address: Type.String({
      description: "NFT item contract address (EQ... or 0:... format)",
    }),
  }),
  category: "data-bearing",
};

export const nftDetailExecutor: ToolExecutor<NftDetailParams> = async (
  params,
  _context
): Promise<ToolResult> => {
  try {
    const { nft_address } = params;

    const res = await tonapiFetch(`/nfts/${encodeURIComponent(nft_address)}`);

    if (res.status === 404) {
      return { success: false, error: `NFT not found: ${nft_address}` };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        error: `TonAPI error ${res.status}: ${text || res.statusText}`,
      };
    }

    const item = await res.json();
    const meta = item.metadata || {};
    const coll = item.collection || {};
    const sale = item.sale;
    const previews: any[] = item.previews || [];
    const { salePrice, marketplace } = formatSalePrice(sale);

    // Extract attributes/traits
    const attributes = Array.isArray(meta.attributes)
      ? meta.attributes.map((a: any) => ({
          trait: a.trait_type || a.key || "unknown",
          value: String(a.value ?? ""),
        }))
      : null;

    const detail = {
      address: nft_address,
      index: item.index ?? 0,
      name: meta.name || "Unnamed NFT",
      description: (meta.description || "").slice(0, 500),
      owner: item.owner?.address || null,
      ownerName: item.owner?.name || null,
      collection: coll.name || null,
      collectionAddress: coll.address || null,
      attributes,
      onSale: !!sale,
      salePrice,
      marketplace,
      previews: {
        small: previews[0]?.url || null,
        medium: previews[1]?.url || null,
        large: previews[2]?.url || null,
      },
      dns: item.dns || null,
      trust: item.trust || "none",
      verified: Array.isArray(item.approved_by) && item.approved_by.length > 0,
      explorer: `https://tonviewer.com/${nft_address}`,
    };

    // Build user-friendly message
    const parts: string[] = [];
    parts.push(`${detail.verified ? "✅" : "🖼️"} ${detail.name}`);
    if (detail.collection) parts.push(`Collection: ${detail.collection}`);
    if (detail.owner) parts.push(`Owner: ${detail.ownerName || detail.owner}`);
    if (detail.onSale && detail.salePrice) parts.push(`On sale: ${detail.salePrice}`);
    if (attributes && attributes.length > 0) {
      const traitStr = attributes
        .slice(0, 5)
        .map((a: { trait: string; value: string }) => `${a.trait}: ${a.value}`)
        .join(", ");
      parts.push(
        `Traits: ${traitStr}${attributes.length > 5 ? ` (+${attributes.length - 5} more)` : ""}`
      );
    }

    return {
      success: true,
      data: {
        ...detail,
        message: parts.join("\n"),
      },
    };
  } catch (error) {
    log.error({ err: error }, "Error in nft_detail");
    return { success: false, error: getErrorMessage(error) };
  }
};
