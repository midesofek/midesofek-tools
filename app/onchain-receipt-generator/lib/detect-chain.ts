import type { Chain } from "../types";

/**
 * Detect the chain from a transaction hash format alone.
 * - EVM: 0x-prefixed, 66 chars (0x + 64 hex chars)
 * - Solana: base58, 87-88 chars (no 0x prefix)
 *
 * Returns "evm" for EVM hashes (caller must then try each EVM chain),
 * "solana" for Solana, or null if neither.
 */
export function detectChainFormat(hash: string): "evm" | "solana" | null {
  const trimmed = hash.trim();

  // EVM: starts with 0x, total length 66, all hex after the 0x
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return "evm";
  }

  // Solana: base58, 87 or 88 chars typically (no 0/O/I/l characters)
  if (/^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(trimmed)) {
    return "solana";
  }

  return null;
}

/**
 * For an EVM hash, we don't know which specific EVM chain it's from until
 * we query the chain. This helper provides the EVM chains we'll try in order.
 * Ethereum first because it has the most volume; Base/BSC after.
 */
export const EVM_CHAINS_TO_TRY: Chain[] = ["ethereum", "base", "bsc"];
