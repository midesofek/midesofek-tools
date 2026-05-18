import type { Chain } from "../types";

/** Detect chain family from a token address. EVM = 0x..., Solana = base58. */
export function detectTokenChainFamily(address: string): "evm" | "solana" {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "evm";
  return "solana";
}

/** Map our Chain enum to DexScreener/GeckoTerminal chain IDs. */
export const DEXSCREENER_CHAIN: Record<Chain, string> = {
  ethereum: "ethereum",
  base: "base",
  bsc: "bsc",
  solana: "solana",
};

export const GECKOTERMINAL_NETWORK: Record<Chain, string> = {
  ethereum: "eth",
  base: "base",
  bsc: "bsc",
  solana: "solana",
};
