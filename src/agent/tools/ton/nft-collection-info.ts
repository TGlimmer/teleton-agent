import { Type } from "@sinclair/typebox";
import type { Tool, ToolExecutor, ToolResult } from "../types.js";
import { tonapiFetch } from "../../../constants/api-endpoints.js";
import { getErrorMessage } from "../../../utils/errors.js";
import { createLogger } from "../../../utils/logger.js";
import { pickPreview } from "./nft-utils.js";

const log = createLogger("Tools");

interface NftCollectionInfoParams {
  collection_address: string;
}

export const nftCollectionInfoTool: Tool = {
  name: "nft_collection_info",
  description:
    "Get information about an NFT collection on TON, including name, description, total items, owner, and social links.",
  parameters: Type.Object({
    collection_address: Type.String({
      description: "NFT collection contract address (EQ... or 0:... format)",
    }),
  }),
  category: "data-bearing",
};

export const nftCollectionInfoExecutor: ToolExecutor<NftCollectionInfoParams> = async (
  params,
  _context
): Promise<ToolResult> => {
  try {
    const { collection_address } = params;

    const res = await tonapiFetch(`/nfts/collections/${encodeURIComponent(collection_address)}`);

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
    const meta = data.metadata || {};
    const previews: any[] = data.previews || [];

    const socialLinks: string[] = [];
    if (meta.external_url) socialLinks.push(meta.external_url);
    if (meta.marketplace) socialLinks.push(meta.marketplace);

    const info = {
      address: collection_address,
      name: meta.name || "Unnamed Collection",
      description: (meta.description || "").slice(0, 500),
      itemsCount: data.next_item_index || 0,
      owner: data.owner?.address || null,
      ownerName: data.owner?.name || null,
      preview: pickPreview(previews),
      socialLinks,
      verified: Array.isArray(data.approved_by) && data.approved_by.length > 0,
      explorer: `https://tonviewer.com/${collection_address}`,
    };

    const parts: string[] = [];
    parts.push(`${info.verified ? "✅" : "📦"} ${info.name}`);
    parts.push(`Items: ${info.itemsCount.toLocaleString()}`);
    if (info.owner) parts.push(`Owner: ${info.ownerName || info.owner}`);
    if (info.description) parts.push(`Description: ${info.description.slice(0, 200)}`);
    if (socialLinks.length > 0) parts.push(`Links: ${socialLinks.join(", ")}`);

    return {
      success: true,
      data: {
        ...info,
        message: parts.join("\n"),
      },
    };
  } catch (error) {
    log.error({ err: error }, "Error in nft_collection_info");
    return { success: false, error: getErrorMessage(error) };
  }
};
