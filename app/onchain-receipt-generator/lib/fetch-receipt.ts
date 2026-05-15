import { detectChainFormat, EVM_CHAINS_TO_TRY } from "./detect-chain";
import { fetchEvmReceipt } from "./fetch-evm";
import { fetchSolanaReceipt } from "./fetch-solana";
import type { Receipt } from "../types";

export type FetchResult =
  | { ok: true; receipt: Receipt }
  | { ok: false; error: string };

export async function fetchReceipt(hash: string): Promise<FetchResult> {
  const trimmed = hash.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a transaction hash" };
  }

  const format = detectChainFormat(trimmed);

  if (format === null) {
    return {
      ok: false,
      error:
        "That doesn't look like a valid transaction hash. EVM hashes are 0x-prefixed and 66 characters; Solana signatures are 87-88 base58 characters.",
    };
  }

  try {
    if (format === "solana") {
      const receipt = await fetchSolanaReceipt(trimmed);
      if (!receipt) {
        return { ok: false, error: "Transaction not found on Solana." };
      }
      return { ok: true, receipt };
    }

    // EVM: try chains in parallel; return the first match
    const results = await Promise.all(
      EVM_CHAINS_TO_TRY.map((chain) =>
        fetchEvmReceipt(trimmed, chain).catch((err) => {
          console.error(`[${chain}] fetch failed:`, err);
          return null;
        }),
      ),
    );

    const found = results.find((r) => r !== null);
    if (!found) {
      return {
        ok: false,
        error:
          "Transaction not found on Ethereum, Base, or BSC. Check the hash and try again.",
      };
    }

    return { ok: true, receipt: found };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to fetch transaction",
    };
  }
}
