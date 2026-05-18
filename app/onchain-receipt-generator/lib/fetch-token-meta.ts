import type { Chain } from "../types";
import { lookupKnownToken } from "./known-tokens";
import { DEXSCREENER_CHAIN, GECKOTERMINAL_NETWORK } from "./chain-detect";

export type TokenMetaResult = {
  symbol: string;
  name?: string;
  decimals: number;
};

// In-process cache for token metadata. Process-lifetime is fine — symbols don't change.
const metaCache = new Map<string, TokenMetaResult>();

/**
 * Fetch token symbol + decimals from external sources.
 * Used as a fallback when on-chain readContract / Helius fails.
 *
 * Architecture (adapted from midesofek's processTokenInfo):
 *   1. DexScreener tokens endpoint
 *   2. GeckoTerminal tokens endpoint
 *
 * Returns null if both sources fail.
 */
export async function fetchTokenMetaFromApis(
  chain: Chain,
  tokenAddress: string,
): Promise<TokenMetaResult | null> {
  const cacheKey = `${chain}-${tokenAddress.toLowerCase()}`;
  const cached = metaCache.get(cacheKey);
  if (cached) return cached;

  // DexScreener first — richest data, fastest response
  try {
    const dsResp = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
    );
    if (dsResp.ok) {
      const dsData = await dsResp.json();
      // DexScreener returns the same token across multiple chains — pick the right one
      const pair =
        dsData?.pairs?.find(
          (p: { chainId?: string }) => p?.chainId === DEXSCREENER_CHAIN[chain],
        ) ?? dsData?.pairs?.[0];

      const symbol = pair?.baseToken?.symbol;
      const name = pair?.baseToken?.name;
      // DexScreener doesn't return decimals, so we need them from elsewhere
      // Use a reasonable default and let the caller verify
      if (symbol) {
        const result = {
          symbol,
          name,
          decimals: pair?.baseToken?.decimals ?? 18,
        };
        metaCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    /* fall through to GeckoTerminal */
  }

  // GeckoTerminal
  try {
    const network = GECKOTERMINAL_NETWORK[chain];
    const gtResp = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${tokenAddress}`,
      { headers: { accept: "application/json;version=20230302" } },
    );
    if (gtResp.ok) {
      const gtData = await gtResp.json();
      const attrs = gtData?.data?.attributes;
      if (attrs?.symbol) {
        const result = {
          symbol: attrs.symbol,
          name: attrs.name,
          decimals: attrs.decimals ?? 18,
        };
        metaCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    /* fall through */
  }

  return null;
}

/**
 * Top-level metadata lookup — combines known-tokens registry + API fallback.
 * Use this when you don't have on-chain access (e.g., during JSON enrichment of cached data).
 */
export async function lookupTokenMeta(
  chain: Chain,
  tokenAddress: string,
): Promise<TokenMetaResult | null> {
  // 1. Known tokens — instant, no API
  const known = lookupKnownToken(chain, tokenAddress);
  if (known) {
    return { symbol: known.symbol, name: known.name, decimals: known.decimals };
  }

  // 2. API fallback
  return fetchTokenMetaFromApis(chain, tokenAddress);
}
