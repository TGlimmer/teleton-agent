import { Type } from "@sinclair/typebox";
import type { Tool, ToolExecutor, ToolResult } from "../types.js";
import { tonapiFetch } from "../../../constants/api-endpoints.js";
import { getErrorMessage } from "../../../utils/errors.js";
import { createLogger } from "../../../utils/logger.js";

const log = createLogger("Tools");

interface NftHistoryParams {
  nft_address: string;
  limit?: number;
}

export const nftHistoryTool: Tool = {
  name: "nft_history",
  description:
    "Get the ownership and sale history of a specific NFT item on TON. Shows transfers, sales, mints, and auction bids with timestamps and prices.",
  parameters: Type.Object({
    nft_address: Type.String({
      description: "NFT item contract address (EQ... or 0:... format)",
    }),
    limit: Type.Optional(
      Type.Number({
        description: "Max events to return (1-100). Defaults to 10.",
        minimum: 1,
        maximum: 100,
      })
    ),
  }),
  category: "data-bearing",
};

interface NftHistoryEvent {
  eventId: string;
  type: string;
  timestamp: number;
  date: string;
  from: string | null;
  to: string | null;
  price: string | null;
  marketplace: string | null;
}

function parseNftEvent(event: any): NftHistoryEvent {
  const action = event.actions?.[0] || {};
  const actionType = action.type || "";

  let type = "other";
  let from: string | null = null;
  let to: string | null = null;
  let price: string | null = null;
  let marketplace: string | null = null;

  if (actionType === "NftItemTransfer") {
    const transfer = action.NftItemTransfer || {};
    from = transfer.sender?.address || null;
    to = transfer.recipient?.address || null;
    // If no sender, it's a mint
    type = from ? "transfer" : "mint";
  } else if (actionType === "NftPurchase") {
    const purchase = action.NftPurchase || {};
    type = "sale";
    from = purchase.seller?.address || null;
    to = purchase.buyer?.address || null;
    marketplace = purchase.marketplace || null;
    if (purchase.amount?.value) {
      const raw = Number(purchase.amount.value);
      if (!isNaN(raw) && raw > 0) {
        const currency = purchase.amount.token_name || "TON";
        price = `${raw / 1e9} ${currency}`;
      }
    }
  } else if (actionType === "AuctionBid") {
    type = "bid";
    const bid = action.AuctionBid || {};
    from = bid.bidder?.address || null;
    if (bid.amount?.value) {
      const raw = Number(bid.amount.value);
      if (!isNaN(raw) && raw > 0) {
        price = `${raw / 1e9} TON`;
      }
    }
  }

  return {
    eventId: event.event_id || "",
    type,
    timestamp: event.timestamp || 0,
    date: event.timestamp ? new Date(event.timestamp * 1000).toISOString() : "",
    from,
    to,
    price,
    marketplace,
  };
}

export const nftHistoryExecutor: ToolExecutor<NftHistoryParams> = async (
  params,
  _context
): Promise<ToolResult> => {
  try {
    const { nft_address } = params;
    const limit = params.limit || 10;

    const res = await tonapiFetch(
      `/nfts/${encodeURIComponent(nft_address)}/history?limit=${limit}`
    );

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

    const data = await res.json();
    const rawEvents: any[] = data.events || [];
    const events: NftHistoryEvent[] = rawEvents.map(parseNftEvent);

    // Build summary
    const saleCount = events.filter((e) => e.type === "sale").length;
    const transferCount = events.filter((e) => e.type === "transfer").length;
    const parts: string[] = [];
    parts.push(`${events.length} event(s) for NFT ${nft_address.slice(0, 12)}...`);
    if (saleCount > 0) parts.push(`${saleCount} sale(s)`);
    if (transferCount > 0) parts.push(`${transferCount} transfer(s)`);

    // Show latest sale price
    const lastSale = events.find((e) => e.type === "sale" && e.price);
    if (lastSale) parts.push(`Last sale: ${lastSale.price}`);

    return {
      success: true,
      data: {
        nftAddress: nft_address,
        totalEvents: events.length,
        events,
        message: parts.join(" | "),
      },
    };
  } catch (error) {
    log.error({ err: error }, "Error in nft_history");
    return { success: false, error: getErrorMessage(error) };
  }
};
