import type { Receipt, Chain, GroupedTransfer, TokenTransfer } from "../types";
import { CHAINS } from "../types";
import { lookupKnownToken } from "./known-tokens";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const GECKOTERMINAL_BASE = "https://api.geckoterminal.com/api/v2";

// Per-process cache. Past prices are immutable, so process-lifetime is fine.
const priceCache = new Map<string, number | null>();

// CoinGecko's platform IDs for our supported chains.
const COINGECKO_PLATFORM: Record<Chain, string> = {
  ethereum: "ethereum",
  base: "base",
  bsc: "binance-smart-chain",
  solana: "solana",
};

// GeckoTerminal's network IDs
const GECKOTERMINAL_NETWORK: Record<Chain, string> = {
  ethereum: "eth",
  base: "base",
  bsc: "bsc",
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
 * Native coin historical price via CoinGecko (ETH, BNB, SOL).
 * These are always listed on CoinGecko — no fallback needed.
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
 * Try CoinGecko's contract → price lookup. Works for listed tokens (USDC, USDT,
 * established projects). Returns null for unlisted / DEX-only tokens.
 */
async function fetchTokenPriceCoinGecko(
  chain: Chain,
  tokenAddress: string,
  date: Date,
): Promise<number | null> {
  try {
    const platform = COINGECKO_PLATFORM[chain];
    const lookupUrl = `${COINGECKO_BASE}/coins/${platform}/contract/${tokenAddress.toLowerCase()}`;
    const lookupResp = await fetch(lookupUrl);
    if (!lookupResp.ok) return null;

    const lookupData = await lookupResp.json();
    const coinId = lookupData?.id;
    if (!coinId) return null;

    return await fetchNativePrice(coinId, date);
  } catch {
    return null;
  }
}

/**
 * Try GeckoTerminal's DEX-data fallback for tokens not listed on CoinGecko.
 * Two-step lookup: find top pool, then fetch that pool's OHLCV for the tx date.
 * Returns null on any failure.
 */
async function fetchTokenPriceGeckoTerminal(
  chain: Chain,
  tokenAddress: string,
  date: Date,
): Promise<number | null> {
  try {
    const network = GECKOTERMINAL_NETWORK[chain];

    // Step 1: find top pool for this token (sorted by liquidity by default)
    const poolsUrl = `${GECKOTERMINAL_BASE}/networks/${network}/tokens/${tokenAddress}/pools?page=1`;
    const poolsResp = await fetch(poolsUrl, {
      headers: { accept: "application/json;version=20230302" },
    });
    if (!poolsResp.ok) return null;

    const poolsData = await poolsResp.json();
    const topPool = poolsData?.data?.[0];
    if (!topPool) return null;

    const poolAddress = topPool.attributes?.address;
    if (!poolAddress) return null;

    // Step 2: fetch daily OHLCV for that pool, anchored to the tx timestamp.
    // before_timestamp returns candles ending at or before that unix time.
    // We add 1 day to ensure the candle covering our tx date is included.
    const beforeTs = Math.floor(date.getTime() / 1000) + 86400;
    const ohlcvUrl =
      `${GECKOTERMINAL_BASE}/networks/${network}/pools/${poolAddress}/ohlcv/day` +
      `?aggregate=1&before_timestamp=${beforeTs}&limit=2&currency=usd&token=base`;

    const ohlcvResp = await fetch(ohlcvUrl, {
      headers: { accept: "application/json;version=20230302" },
    });
    if (!ohlcvResp.ok) return null;

    const ohlcvData = await ohlcvResp.json();
    const candles: number[][] = ohlcvData?.data?.attributes?.ohlcv_list ?? [];
    if (candles.length === 0) return null;

    // Pick the candle whose date matches the tx date (UTC day).
    // ohlcv format: [timestamp_seconds, open, high, low, close, volume]
    const txDay = Math.floor(date.getTime() / 1000 / 86400);
    const matching = candles.find((c) => Math.floor(c[0]! / 86400) === txDay);
    const candle = matching ?? candles[0]; // fall back to nearest available
    if (!candle) return null;

    return candle[4]!; // close price (USD)
  } catch {
    return null;
  }
}

/**
 * Fetch the USD price of an ERC-20 / SPL token at a specific date.
 * Tries CoinGecko first (listed tokens), falls back to GeckoTerminal (DEX-only tokens).
 */
async function fetchTokenPrice(
  chain: Chain,
  tokenAddress: string,
  date: Date,
): Promise<number | null> {
  const dateStr = formatCgDate(date);
  const cacheKey = `token-${chain}-${tokenAddress.toLowerCase()}-${dateStr}`;
  if (priceCache.has(cacheKey)) return priceCache.get(cacheKey)!;

  // 1. Known tokens with stable peg — zero API, perfect reliability
  const known = lookupKnownToken(chain, tokenAddress);
  if (known?.stablePrice !== undefined) {
    priceCache.set(cacheKey, known.stablePrice);
    return known.stablePrice;
  }

  // 2. Native wrapper (WETH, WSOL, WBNB) — price as the native coin
  if (known?.isNativeWrapper) {
    const chainInfo = CHAINS[chain];
    const nativePrice = await fetchNativePrice(chainInfo.coingeckoId, date);
    priceCache.set(cacheKey, nativePrice);
    return nativePrice;
  }

  // 3. CoinGecko (listed tokens, accurate historical)
  let price = await fetchTokenPriceCoinGecko(chain, tokenAddress, date);

  // 4. GeckoTerminal (DEX-only tokens)
  if (price === null) {
    price = await fetchTokenPriceGeckoTerminal(chain, tokenAddress, date);
  }

  priceCache.set(cacheKey, price);
  return price;
}

function groupTransfers(transfers: TokenTransfer[]): GroupedTransfer[] {
  if (transfers.length === 0) return [];

  const byToken = new Map<string, TokenTransfer[]>();
  for (const t of transfers) {
    const key = t.tokenAddress.toLowerCase();
    const list = byToken.get(key) ?? [];
    list.push(t);
    byToken.set(key, list);
  }

  const groups: GroupedTransfer[] = [];

  for (const [, list] of byToken) {
    const senders = new Set(list.map((t) => t.from.toLowerCase()));
    const recipients = new Set(list.map((t) => t.to.toLowerCase()));

    const totalAmount = list
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      .toString();

    const totalUsd = list.some((t) => t.usdValue !== undefined)
      ? list.reduce((sum, t) => sum + (t.usdValue ?? 0), 0)
      : undefined;

    const direction: GroupedTransfer["direction"] =
      list.length === 1
        ? "single"
        : senders.size === 1 && recipients.size > 1
          ? "one-to-many"
          : senders.size > 1 && recipients.size === 1
            ? "many-to-one"
            : "many-to-many";

    groups.push({
      token: { symbol: list[0]!.symbol, address: list[0]!.tokenAddress },
      totalAmount,
      totalUsdValue: totalUsd,
      recipientCount: recipients.size,
      senderCount: senders.size,
      direction,
      transfers: list,
    });
  }

  groups.sort((a, b) => (b.totalUsdValue ?? 0) - (a.totalUsdValue ?? 0));
  return groups;
}

/**
 * Enrich a Receipt with USD values. Failures are non-fatal.
 */
export async function enrichReceiptWithPrices(
  receipt: Receipt,
): Promise<Receipt> {
  const chainInfo = CHAINS[receipt.chain];
  const date = receipt.timestamp;

  const nativePrice = await fetchNativePrice(chainInfo.coingeckoId, date);

  const tokenPrices = await Promise.all(
    receipt.tokenTransfers.map((t) =>
      fetchTokenPrice(receipt.chain, t.tokenAddress, date),
    ),
  );

  const enrichedTokenTransfers = receipt.tokenTransfers.map((t, i) => ({
    ...t,
    usdValue:
      tokenPrices[i] !== null
        ? parseFloat(t.amount) * tokenPrices[i]!
        : undefined,
  }));

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
    tokenTransfers: enrichedTokenTransfers,
    groupedTransfers: groupTransfers(enrichedTokenTransfers),
  };
}
