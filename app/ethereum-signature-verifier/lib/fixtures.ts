/**
 * Frozen test vectors. These values never change.
 *
 * Generated in Phase 0 from viem + cross-checked against an independent
 * Python implementation (eth-account). Every phase of the verifier tests
 * against this file — if a change breaks these, the change is wrong.
 *
 * The private key is a throwaway used only to produce a stable signature.
 * It holds nothing and never will.
 */

import type { Address, Hex } from "viem";

export const EIP191 = {
  message: "Login to CoolApp",
  /** keccak256("\x19Ethereum Signed Message:\n16" + message) */
  digest:
    "0x52fcdfbc5773d56957bfa4cc3629dd15b117ffebd4f08b327dc18d76d5bc1b32" as Hex,
  /** keccak256(message) with NO prefix — the classic bug. Must never equal `digest`. */
  naiveNoPrefix:
    "0xb5b6400da33d7b376c36a7d1c3e52bcff1c6ec55ca6ec0b964b0c068c7b11c3a" as Hex,
} as const;

export const EIP712 = {
  typedData: {
    domain: {
      name: "CoolApp",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    types: {
      Mail: [
        { name: "from", type: "address" },
        { name: "contents", type: "string" },
      ],
    },
    primaryType: "Mail",
    message: {
      from: "0x0000000000000000000000000000000000000001",
      contents: "Login to CoolApp",
    },
  },
  digest:
    "0x7435f8584185e1fcf2e0077d4a4b19189c759ab9da3771c9c0e5a0af96448b90" as Hex,
  /** Identical data, chainId 8453. Proves the domain separator binds the chain. */
  digestOnBase:
    "0xc31229c7fadaf484be2a07bd6608b8248cb4aae550d70733a12de0234585728c" as Hex,
} as const;

export const RAW_HASH = {
  digest:
    "0xc6cc09ffef9231a49d6e7c7cc1e3129176557c0f157ac784149c25462132fbfd" as Hex,
} as const;

/** Stable EOA signature over EIP191.message. Used from Phase 3 onward. */
export const EOA = {
  privateKey:
    "0x1111111111111111111111111111111111111111111111111111111111111111" as Hex,
  address: "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A" as Address,
  message: "Login to CoolApp",
  digest:
    "0x52fcdfbc5773d56957bfa4cc3629dd15b117ffebd4f08b327dc18d76d5bc1b32" as Hex,

  /** Canonical signature, v = 27. */
  signature:
    "0xe177f5f353d64286d9fa65952481e7ce98fafb6b36eefa6e8b9dcbf221bd499b6afd15405e7b69c9afce45f53c6105d33dbae1cf912ed9d1b5beeb3f777c70001b" as Hex,

  /** Same r/s, v = 0 (raw recovery id). Must normalize to the canonical sig. */
  signatureRecId:
    "0xe177f5f353d64286d9fa65952481e7ce98fafb6b36eefa6e8b9dcbf221bd499b6afd15405e7b69c9afce45f53c6105d33dbae1cf912ed9d1b5beeb3f777c700000" as Hex,

  /** Same r/s, v = 31 (eth_sign / Ledger / Safe convention). viem throws on this raw. */
  signatureEthSign:
    "0xe177f5f353d64286d9fa65952481e7ce98fafb6b36eefa6e8b9dcbf221bd499b6afd15405e7b69c9afce45f53c6105d33dbae1cf912ed9d1b5beeb3f777c70001f" as Hex,

  /** Malleable twin: s = N − s, v flipped. Verifies to the same signer, but high-s. */
  signatureHighS:
    "0xe177f5f353d64286d9fa65952481e7ce98fafb6b36eefa6e8b9dcbf221bd499b9502eabfa18496365031ba0ac39efa2b7cf3fb171e19c66a0a13734d58b9d1411c" as Hex,

  /** A different address, for the recovered-≠-claimed case. */
  otherAddress: "0x1563915e194D8CfBA1943570603F7606A3115508" as Address,
} as const;

/**
 * Filled in as later phases need them — collect from block explorers.
 *   safe:      a deployed Safe + the chain it lives on   (Phase 4/5)
 *   sig6492:   a 6492-wrapped signature                  (Phase 6)
 *   account7702: an address with an active delegation    (Phase 7)
 */
export const TODO = {
  safeAddress: null as Address | null,
  safeChainId: null as number | null,
  sig6492: null as Hex | null,
  account7702: null as Address | null,
} as const;
