import type { Address, Hex } from "viem";
import type { VerificationResult } from "./types";

const SAFE: Address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201c2a1";
const EOA_CLAIMED: Address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201c2a1";
const EOA_RECOVERED: Address = "0x9a3f7C2e5B8d0A6c3F1e9B4d7A2c5F8e0b3D42b1";
const DELEGATE: Address = "0x7702aB3c9D1e5F8a0C2b4D6e8F0a1C3b5D7e9F02";

const DIGEST_SIGNED: Hex =
  "0x4a1c8f3e2b7d6a5c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b9f02";
const DIGEST_EXPECTED: Hex =
  "0xd83b41ae9c7f2e5b8d0a6c3f1e9b4d7a2c5f8e0b3d6a9c1f4e7b0d3a6c8f41ae";

/** Every designed result-panel state, one fixture each — for the /gallery route only, never shipped in the live tool. */
export const fixtures: Record<string, VerificationResult> = {
  valid: {
    status: "valid",
    path: "erc1271",
    accountKind: "contract",
    pathLabel: "ERC-1271 · Safe · Base",
    summary:
      "The Safe wrapped the digest, recovered its owner, and confirmed the signature — the login is authentic.",
    latencyMs: 318,
    matchedDigest: DIGEST_EXPECTED,
    trace: [
      {
        label: "Detected",
        detail: `code found at ${SAFE}`,
        status: "ok",
        copyValue: SAFE,
      },
      { label: "Identified", detail: "Safe v1.4.1 · Gnosis Safe proxy", status: "ok" },
      { label: "Wrapped", detail: "SafeMessage EIP-712 wrapper applied", status: "ok" },
      {
        label: "Called",
        detail: "isValidSignature → 0x1626ba7e (magic value)",
        status: "ok",
      },
    ],
    findings: ["2 of 3 owners signed (threshold met)"],
  },

  "invalid-safe": {
    status: "invalid",
    path: "erc1271",
    accountKind: "contract",
    pathLabel: "ERC-1271 · Safe · Base",
    summary:
      "The digest was built without Safe's message wrapper, so the Safe rejected it.",
    latencyMs: 412,
    trace: [
      {
        label: "Detected",
        detail: `code found at ${SAFE}`,
        status: "ok",
        copyValue: SAFE,
      },
      { label: "Identified", detail: "Safe v1.4.1 · Gnosis Safe proxy", status: "ok" },
      { label: "Split", detail: "65-byte sig · r,s,v · no 6492 suffix", status: "ok" },
      {
        label: "Hashed",
        detail: "EIP-712 typed-data · domain chainId 8453",
        status: "ok",
      },
      {
        label: "Called",
        detail: "isValidSignature → 0xffffffff (rejected)",
        status: "fail",
      },
    ],
    findings: [
      "v normalized 31 → 27 (eth_sign convention)",
      "legacy ERC-1271 interface",
    ],
    digests: {
      actual: DIGEST_SIGNED,
      expected: DIGEST_EXPECTED,
      expectedLabel: "The Safe expected",
    },
  },

  loading: {
    status: "loading",
    path: "erc1271",
    accountKind: "contract",
    trace: [
      {
        label: "Detected",
        detail: `code found at ${SAFE}`,
        status: "ok",
        copyValue: SAFE,
      },
      { label: "Identified", detail: "Safe v1.4.1 · Gnosis Safe proxy", status: "ok" },
      { label: "Split", detail: "recovering signer…", status: "running" },
      { label: "Hashed", detail: "queued", status: "pending" },
      { label: "Called", detail: "queued", status: "pending" },
    ],
  },

  undetermined: {
    status: "unknown",
    path: "erc1271",
    accountKind: "contract",
    pathLabel: "ERC-1271 · Base",
    summary:
      "The Base RPC timed out after 10s — we never got an answer. This is not a rejection.",
    cause: "timeout",
    trace: [
      {
        label: "Resolved",
        detail: `address checksum ok · ${SAFE}`,
        status: "ok",
      },
      {
        label: "Connected",
        detail: "eth_getCode via base-rpc — timeout 10000ms · 3 retries",
        status: "warn",
      },
      {
        label: "Verify",
        detail: "aborted — no response from chain",
        status: "pending",
      },
    ],
  },

  "eoa-recovered": {
    status: "invalid",
    path: "eoa",
    accountKind: "eoa",
    pathLabel: "EOA",
    summary:
      "The signature is cryptographically valid — but it recovers a different address than the one you entered.",
    trace: [
      {
        label: "Detected",
        detail: "no code at address — externally owned",
        status: "ok",
      },
      { label: "Hashed", detail: "EIP-191 personal_sign digest", status: "ok" },
      {
        label: "Recovered",
        detail: `ecrecover → ${EOA_RECOVERED}`,
        status: "ok",
        copyValue: EOA_RECOVERED,
      },
      {
        label: "Compared",
        detail: "recovered ≠ claimed address",
        status: "fail",
      },
    ],
    findings: [
      "v normalized 31 → 27 (eth_sign convention)",
      "high-s signature (malleable)",
    ],
    addresses: {
      claimed: EOA_CLAIMED,
      recovered: EOA_RECOVERED,
      recoveredNote: "Likely your other wallet.",
    },
  },

  multichain: {
    status: "multichain",
    pathLabel: "ERC-1271 · Safe",
    summary:
      "Verification differs by chain — the Safe is configured differently on each.",
    chains: [
      {
        chain: "base",
        chainLabel: "Base",
        status: "valid",
        detail: "isValidSignature → 0x1626ba7e",
        latencyMs: 210,
      },
      {
        chain: "ethereum",
        chainLabel: "Ethereum",
        status: "invalid",
        detail: "digest mismatch — no Safe wrapper",
        latencyMs: 168,
      },
      {
        chain: "arbitrum",
        chainLabel: "Arbitrum",
        status: "unknown",
        detail: "arbitrum-rpc timed out (10s)",
        latencyMs: 10000,
      },
    ],
  },

  "dual-7702": {
    status: "dual-path",
    delegate: DELEGATE,
    trace: [
      {
        label: "Detected",
        detail: "0xef0100 delegation prefix — active 7702",
        status: "ok",
      },
      {
        label: "Split",
        detail: "running key-based and contract-based checks",
        status: "ok",
      },
      { label: "Recovered", detail: "ecrecover → account key ✓", status: "ok" },
      {
        label: "Called",
        detail: "delegate.isValidSignature → 0xffffffff",
        status: "fail",
      },
    ],
    eoaResult: {
      status: "valid",
      detail: "secp256k1 key\nsigned by the account key",
    },
    smartAccountResult: {
      status: "invalid",
      detail: `ERC-1271 · delegate ${DELEGATE}\ndelegate rejected the digest`,
    },
  },
};
