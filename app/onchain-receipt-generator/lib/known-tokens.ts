import type { Chain } from "../types";

export type TokenInfo = {
  symbol: string;
  name: string;
  decimals: number;
  /** USD price when stable (pegged). undefined = fetch from API. */
  stablePrice?: number;
  /** True if this is a wrapped/canonical proxy for the native coin (WETH, WSOL, WBNB). */
  isNativeWrapper?: boolean;
};

// Known tokens — symbol/decimals/price are guaranteed correct without API calls.
// Address keys are lowercased for case-insensitive lookup.
export const KNOWN_TOKENS: Record<Chain, Record<string, TokenInfo>> = {
  ethereum: {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      stablePrice: 1,
    },
    "0xdac17f958d2ee523a2206206994597c13d831ec7": {
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      stablePrice: 1,
    },
    "0x6b175474e89094c44da98b954eedeac495271d0f": {
      symbol: "DAI",
      name: "Dai",
      decimals: 18,
      stablePrice: 1,
    },
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      isNativeWrapper: true,
    },
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": {
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
    },
  },
  base: {
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      stablePrice: 1,
    },
    "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2": {
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      stablePrice: 1,
    },
    "0x4200000000000000000000000000000000000006": {
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      isNativeWrapper: true,
    },
  },
  bsc: {
    "0x55d398326f99059ff775485246999027b3197955": {
      symbol: "USDT",
      name: "Tether USD",
      decimals: 18,
      stablePrice: 1,
    },
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 18,
      stablePrice: 1,
    },
    "0xe9e7cea3dedca5984780bafc599bd69add087d56": {
      symbol: "BUSD",
      name: "Binance USD",
      decimals: 18,
      stablePrice: 1,
    },
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": {
      symbol: "WBNB",
      name: "Wrapped BNB",
      decimals: 18,
      isNativeWrapper: true,
    },
  },
  solana: {
    epjfwdd5aufqssqem2qn1xzybapc8g4weggkzwytdt1v: {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      stablePrice: 1,
    },
    es9vmfrzacermjfrf4h2fyd4kconky11mcce8benwnyb: {
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      stablePrice: 1,
    },
    so11111111111111111111111111111111111111112: {
      symbol: "WSOL",
      name: "Wrapped SOL",
      decimals: 9,
      isNativeWrapper: true,
    },
  },
};

export function lookupKnownToken(
  chain: Chain,
  address: string,
): TokenInfo | null {
  const chainTokens = KNOWN_TOKENS[chain];
  if (!chainTokens) return null;
  return chainTokens[address.toLowerCase()] ?? null;
}
