/**
 * Shared NFT formatting utilities.
 * Extracts common mapping logic used by nft_list, nft_detail, nft_collection_items, nft_on_sale.
 */

export interface NftItemSummary {
  address: string;
  index: number;
  name: string;
  description: string;
  owner: string | null;
  collection: string | null;
  collectionAddress: string | null;
  preview: string | null;
  onSale: boolean;
  salePrice: string | null;
  marketplace: string | null;
  dns: string | null;
  trust: string;
  explorer: string;
}

/** Pick a mid-resolution preview URL from TonAPI previews array */
export function pickPreview(previews: any[]): string | null {
  if (!Array.isArray(previews) || previews.length === 0) return null;
  // Index 1 = 500x500, Index 0 = 100x100, Index 2 = 1500x1500
  return previews[1]?.url || previews[0]?.url || null;
}

/** Extract and format sale price from TonAPI sale object */
export function formatSalePrice(sale: any): {
  salePrice: string | null;
  marketplace: string | null;
} {
  if (!sale?.price?.value) return { salePrice: null, marketplace: null };
  const raw = Number(sale.price.value);
  if (isNaN(raw) || raw <= 0) return { salePrice: null, marketplace: sale?.marketplace || null };
  const amount = raw / 1e9;
  const currency = sale.price.token_name || "TON";
  return {
    salePrice: `${amount} ${currency}`,
    marketplace: sale.marketplace || null,
  };
}

/** Map a raw TonAPI NftItem to a compact summary */
export function mapNftItemSummary(item: any): NftItemSummary {
  const meta = item.metadata || {};
  const coll = item.collection || {};
  const sale = item.sale;
  const previews: any[] = item.previews || [];
  const { salePrice, marketplace } = formatSalePrice(sale);

  return {
    address: item.address,
    index: item.index ?? 0,
    name: meta.name || "Unnamed NFT",
    description: (meta.description || "").slice(0, 100),
    owner: item.owner?.address || null,
    collection: coll.name || null,
    collectionAddress: coll.address || null,
    preview: pickPreview(previews),
    onSale: !!sale,
    salePrice,
    marketplace,
    dns: item.dns || null,
    trust: item.trust || "none",
    explorer: `https://tonviewer.com/${item.address}`,
  };
}
