import type { Receipt, Chain } from "../types";
import { CHAINS } from "../types";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// Per-process cache. Key: `${platform}-${address-or-id}-${date}`. Value: USD price.
// Past prices are immutable, so cache lifetime = process lifetime is fine.
const priceCache = new Map<string, number | null>();

const COINGECKO_PLATFORM: Record<Chain, string> = {
  ethereum: "ethereum",
  base: "base",
  bsc: "binance-smart-chain",
  solana: "solana",
};

/**
 * Format a Date to dd-mm-yyyy as CoinGecko expects for historical endpoints.
 */
function formatCgDate(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Fetch the USD price of a native coin (ETH, BNB, SOL) on a specific date.
 * Returns null on any failure — caller should treat absence of price as non-fatal.
 */
async function fetchNativePrice(
  coinId: string,
  date: Date,
): Promise<number | null> {
  const dateStr = formatCgDate(date);
  const cacheKey = `native-${coinId}-${dateStr}`;
  if (priceCache.has(cacheKey)) return priceCache.get(cacheKey)!;

  try {
    const url = `${COINGECKO_BASE}/coins/${coinId}/history?date=${dateStr}&localization=false`;
    const resp = await fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!resp.ok) {
      priceCache.set(cacheKey, null);
      return null;
    }
    const data = await resp.json();
    const price = data?.market_data?.current_price?.usd ?? null;
    priceCache.set(cacheKey, price);
    return price;
  } catch {
    priceCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Fetch the USD price of an ERC-20 / SPL token by contract address on a specific date.
 * Returns null on any failure.
 */
async function fetchTokenPrice(
  chain: Chain,
  tokenAddress: string,
  date: Date,
): Promise<number | null> {
  const dateStr = formatCgDate(date);
  const platform = COINGECKO_PLATFORM[chain];
  const cacheKey = `token-${platform}-${tokenAddress.toLowerCase()}-${dateStr}`;
  if (priceCache.has(cacheKey)) return priceCache.get(cacheKey)!;

  try {
    // Step 1: resolve contract address → coin ID
    const lookupUrl = `${COINGECKO_BASE}/coins/${platform}/contract/${tokenAddress.toLowerCase()}`;
    const lookupResp = await fetch(lookupUrl);
    if (!lookupResp.ok) {
      priceCache.set(cacheKey, null);
      return null;
    }
    const lookupData = await lookupResp.json();
    const coinId = lookupData?.id;
    if (!coinId) {
      priceCache.set(cacheKey, null);
      return null;
    }

    // Step 2: fetch historical price by ID
    const price = await fetchNativePrice(coinId, date);
    priceCache.set(cacheKey, price);
    return price;
  } catch {
    priceCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Enrich a Receipt with USD values for native value, fee, and all token transfers.
 * Failures are non-fatal — fields stay undefined, receipt is still valid.
 */
export async function enrichReceiptWithPrices(
  receipt: Receipt,
): Promise<Receipt> {
  const chainInfo = CHAINS[receipt.chain];
  const date = receipt.timestamp;

  // Native price (used for both value and fee)
  const nativePrice = await fetchNativePrice(chainInfo.coingeckoId, date);

  // Token prices in parallel
  const tokenPrices = await Promise.all(
    receipt.tokenTransfers.map((t) =>
      fetchTokenPrice(receipt.chain, t.tokenAddress, date),
    ),
  );

  return {
    ...receipt,
    value: {
      ...receipt.value,
      usdValue:
        nativePrice !== null
          ? parseFloat(receipt.value.amount) * nativePrice
          : undefined,
    },
    fee: {
      ...receipt.fee,
      usdValue:
        nativePrice !== null
          ? parseFloat(receipt.fee.amount) * nativePrice
          : undefined,
    },
    tokenTransfers: receipt.tokenTransfers.map((t, i) => ({
      ...t,
      usdValue:
        tokenPrices[i] !== null
          ? parseFloat(t.amount) * tokenPrices[i]!
          : undefined,
    })),
  };
}
