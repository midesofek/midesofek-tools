import type { Address } from "viem";
import {
  lookupDelegate,
  toAttribution,
  type KnownDelegate,
} from "./known-delegates";
import type { Attribution, RiskLevel } from "../types";

export type RiskAssessment = {
  risk: RiskLevel;
  reason: string;
  delegateName?: string;
  attribution?: Attribution;
};

/**
 * Map a source's raw category label to our RiskLevel.
 *
 * Wintermute's tags include "Crime" (sweepers), "Retail Wallets" (wallet
 * vendors like MetaMask/Bitget/Alchemy), and "Service" (dApps). Anything we
 * don't recognize we treat as "unknown" — a labeled delegate we can't
 * classify is more useful shown to the user than silently dropped.
 */
function categoryToRisk(category: string): RiskLevel {
  const normalized = category.trim().toLowerCase();

  // Malicious tags
  if (normalized === "crime") return "malicious";
  if (normalized.includes("sweep")) return "malicious";
  if (normalized.includes("phish")) return "malicious";

  // Verified-safe tags
  if (normalized === "retail wallets") return "safe";
  if (normalized === "service") return "safe";
  if (normalized === "wallet") return "safe";

  return "unknown";
}

/**
 * Classify a delegate contract.
 *
 * Order matters:
 *   1. Known delegate + category maps to malicious → malicious (even if codeless)
 *   2. Delegate has no on-chain code → broken (dangling pointer)
 *   3. Known delegate + category maps to safe → safe
 *   4. Known delegate but category unknown → unknown (with source shown)
 *   5. Unknown entirely → unknown (honest default)
 */
export function assessDelegate(
  delegate: Address,
  delegateCodeSize: number,
): RiskAssessment {
  const known = lookupDelegate(delegate);

  if (known) {
    const risk = categoryToRisk(known.category);

    if (risk === "malicious") {
      return {
        risk: "malicious",
        reason: buildReason("malicious", known),
        delegateName: known.name,
        attribution: toAttribution(known),
      };
    }

    if (delegateCodeSize === 0) {
      // A known-good delegate that got un-deployed. Rare, but real. Report broken
      // and preserve the attribution so the user knows what it WAS.
      return {
        risk: "broken",
        reason:
          "The delegate address has no code on-chain, so this delegation is currently broken. " +
          `The delegate was previously identified as ${known.name} (${known.category}) by ${known.source}.`,
        delegateName: known.name,
        attribution: toAttribution(known),
      };
    }

    if (risk === "safe") {
      return {
        risk: "safe",
        reason: buildReason("safe", known),
        delegateName: known.name,
        attribution: toAttribution(known),
      };
    }

    // Known contract, unfamiliar category label.
    return {
      risk: "unknown",
      reason:
        `${known.source} labels this delegate "${known.name}" under category "${known.category}", ` +
        "but that category isn't one we automatically classify as safe or malicious. " +
        "Look it up on Etherscan to confirm.",
      delegateName: known.name,
      attribution: toAttribution(known),
    };
  }

  // Not in any list.
  if (delegateCodeSize === 0) {
    return {
      risk: "broken",
      reason:
        "The delegate address has no code on-chain. This delegation is broken — calls to your account will not execute anything useful. This can happen if the delegate was never deployed, or was self-destructed after your account was delegated to it.",
    };
  }

  return {
    risk: "unknown",
    reason:
      "This delegate is not in our known-delegates lists. That doesn't mean it's dangerous — it means we can't classify it. Look up the address on Etherscan: check whether the contract is verified, whether it's audited, and whether your wallet vendor lists it as their official implementation.",
  };
}

function buildReason(kind: "safe" | "malicious", d: KnownDelegate): string {
  if (kind === "malicious") {
    return (
      `${d.source} has flagged this delegate as "${d.name}" (${d.category}) — ` +
      "a known sweeper / phishing contract. If you're seeing this on your own address, " +
      "treat your wallet as compromised: move any remaining assets from a fresh EOA (not this one) " +
      "and revoke the delegation by signing a new authorization to the zero address."
    );
  }
  return `Verified delegate: ${d.name} (${d.category}), classified by ${d.source}.`;
}
