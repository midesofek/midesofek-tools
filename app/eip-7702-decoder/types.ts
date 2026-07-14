import type { Address, Hex } from "viem";

/**
 * The 3-byte delegation indicator that starts every EIP-7702 code field.
 * See EIP-7702, "Behavior" section: code becomes 0xef0100 || delegate_address.
 */
export const DELEGATION_PREFIX = "0xef0100" as const;

/** Total bytes of a valid EIP-7702 code field: 3 (prefix) + 20 (address) = 23. */
export const DELEGATION_CODE_LENGTH = 23;

/**
 * Result of classifying a delegate contract against the known lists.
 * "unknown" is the honest default — we'd rather say we don't know than
 * inspire false confidence.
 *
 *   safe      → in the whitelist (wallet vendor / verified implementation)
 *   malicious → in the blocklist (Wintermute-tagged sweeper, or similar)
 *   broken    → delegated to an address that has no on-chain code
 *   unknown   → not in any list; user should investigate on Etherscan
 */
export type RiskLevel = "safe" | "malicious" | "broken" | "unknown";

/**
 * A single classification attached to a delegate — always sourced.
 * The UI shows this as "Flagged by <source>" rather than a bare verdict.
 */
export type Attribution = {
  source: string;      // e.g. "Wintermute Research"
  sourceUrl?: string;  // link the UI turns the source name into
  category?: string;   // the source's own label (e.g. "Crime", "Retail Wallets")
  syncedAt?: string;   // ISO timestamp — when we last pulled from the source
};

/**
 * The tool's canonical response shape. One address in, one of these out.
 * Discriminated on `status` so the UI can render cleanly per case.
 */
export type DelegationCheck =
  | {
      status: "plain-eoa";
      address: Address;
    }
  | {
      status: "contract";
      address: Address;
      /** Just the size in bytes — we don't return the full bytecode to the client. */
      codeSize: number;
    }
  | {
      status: "delegated";
      address: Address;
      delegate: Address;
      /** Raw on-chain code — always exactly 46 hex chars after the 0x. */
      rawCode: Hex;
      risk: RiskLevel;
      /** Human-readable name if the delegate is in the known-delegates list. */
      delegateName?: string;
      /** Explanation of the risk classification, shown to the user. */
      reason: string;
      /** Bytes of the delegate contract's code. Zero means broken delegation. */
      delegateCodeSize: number;
      /** Who classified this delegate. Present iff delegate is in a known list. */
      attribution?: Attribution;
    };

/** Server-side API response envelope. */
export type CheckResponse =
  | { ok: true; check: DelegationCheck }
  | { ok: false; error: string };
