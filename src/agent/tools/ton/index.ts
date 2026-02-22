import { tonGetAddressTool, tonGetAddressExecutor } from "./get-address.js";
import { tonGetBalanceTool, tonGetBalanceExecutor } from "./get-balance.js";
import { tonPriceTool, tonPriceExecutor } from "./get-price.js";
import { tonSendTool, tonSendExecutor } from "./send.js";
import { tonGetTransactionsTool, tonGetTransactionsExecutor } from "./get-transactions.js";
import { tonMyTransactionsTool, tonMyTransactionsExecutor } from "./my-transactions.js";
import { tonChartTool, tonChartExecutor } from "./chart.js";
import { nftListTool, nftListExecutor } from "./nft-list.js";
import { nftDetailTool, nftDetailExecutor } from "./nft-detail.js";
import { nftTransferTool, nftTransferExecutor } from "./nft-transfer.js";
import { nftCollectionInfoTool, nftCollectionInfoExecutor } from "./nft-collection-info.js";
import { nftHistoryTool, nftHistoryExecutor } from "./nft-history.js";
import { nftCollectionItemsTool, nftCollectionItemsExecutor } from "./nft-collection-items.js";
import { nftOnSaleTool, nftOnSaleExecutor } from "./nft-on-sale.js";
import { jettonSendTool, jettonSendExecutor } from "./jetton-send.js";
import { jettonBalancesTool, jettonBalancesExecutor } from "./jetton-balances.js";
import { jettonInfoTool, jettonInfoExecutor } from "./jetton-info.js";
import { jettonPriceTool, jettonPriceExecutor } from "./jetton-price.js";
import { jettonHoldersTool, jettonHoldersExecutor } from "./jetton-holders.js";
import { jettonHistoryTool, jettonHistoryExecutor } from "./jetton-history.js";
import { dexQuoteTool, dexQuoteExecutor } from "./dex-quote.js";
import type { ToolEntry } from "../types.js";

export { tonGetAddressTool, tonGetAddressExecutor };
export { tonGetBalanceTool, tonGetBalanceExecutor };
export { tonPriceTool, tonPriceExecutor };
export { tonSendTool, tonSendExecutor };
export { tonGetTransactionsTool, tonGetTransactionsExecutor };
export { tonMyTransactionsTool, tonMyTransactionsExecutor };
export { tonChartTool, tonChartExecutor };
export { nftListTool, nftListExecutor };
export { nftDetailTool, nftDetailExecutor };
export { nftTransferTool, nftTransferExecutor };
export { nftCollectionInfoTool, nftCollectionInfoExecutor };
export { nftHistoryTool, nftHistoryExecutor };
export { nftCollectionItemsTool, nftCollectionItemsExecutor };
export { nftOnSaleTool, nftOnSaleExecutor };
export { jettonSendTool, jettonSendExecutor };
export { jettonBalancesTool, jettonBalancesExecutor };
export { jettonInfoTool, jettonInfoExecutor };
export { jettonPriceTool, jettonPriceExecutor };
export { jettonHoldersTool, jettonHoldersExecutor };
export { jettonHistoryTool, jettonHistoryExecutor };
export { dexQuoteTool, dexQuoteExecutor };

export const tools: ToolEntry[] = [
  { tool: tonSendTool, executor: tonSendExecutor, scope: "dm-only" },
  { tool: tonGetAddressTool, executor: tonGetAddressExecutor },
  { tool: tonGetBalanceTool, executor: tonGetBalanceExecutor },
  { tool: tonPriceTool, executor: tonPriceExecutor },
  { tool: tonGetTransactionsTool, executor: tonGetTransactionsExecutor },
  { tool: tonMyTransactionsTool, executor: tonMyTransactionsExecutor },
  { tool: tonChartTool, executor: tonChartExecutor },
  { tool: nftListTool, executor: nftListExecutor },
  { tool: nftDetailTool, executor: nftDetailExecutor },
  { tool: nftTransferTool, executor: nftTransferExecutor, scope: "dm-only" },
  { tool: nftCollectionInfoTool, executor: nftCollectionInfoExecutor },
  { tool: nftHistoryTool, executor: nftHistoryExecutor },
  { tool: nftCollectionItemsTool, executor: nftCollectionItemsExecutor },
  { tool: nftOnSaleTool, executor: nftOnSaleExecutor },
  { tool: jettonSendTool, executor: jettonSendExecutor, scope: "dm-only" },
  { tool: jettonBalancesTool, executor: jettonBalancesExecutor },
  { tool: jettonInfoTool, executor: jettonInfoExecutor },
  { tool: jettonPriceTool, executor: jettonPriceExecutor },
  { tool: jettonHoldersTool, executor: jettonHoldersExecutor },
  { tool: jettonHistoryTool, executor: jettonHistoryExecutor },
  { tool: dexQuoteTool, executor: dexQuoteExecutor },
];
