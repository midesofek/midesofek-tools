import {
  createPublicClient,
  http,
  getAddress,
  isAddress,
  type Address,
  type Hex,
} from "viem";
import { mainnet } from "viem/chains";
import {
  DELEGATION_PREFIX,
  DELEGATION_CODE_LENGTH,
  type DelegationCheck,
} from "../types";
import { assessDelegate } from "./assess-risk";

/**
 * viem PublicClient bound to Ethereum mainnet via Alchemy.
 * Multi-chain support is a v2 concern; for now every check is mainnet.
 */
function getClient() {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY is not set");
  return createPublicClient({
    chain: mainnet,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`),
  });
}

/**
 * Check whether an address is EIP-7702 delegated, and if so, assess the
 * delegate. Two RPC calls in the delegated case: getCode on the target,
 * then getCode on the delegate to detect broken-pointer state.
 *
 * Throws only on infrastructure failures (RPC down, bad env). Business
 * outcomes ("address is invalid") return a discriminated result instead.
 */
export async function checkDelegation(
  input: string,
): Promise<{ ok: true; check: DelegationCheck } | { ok: false; error: string }> {
  const trimmed = input.trim();
  if (!isAddress(trimmed)) {
    return { ok: false, error: "That doesn't look like a valid Ethereum address." };
  }
  const target = getAddress(trimmed);

  const client = getClient();
  const rawCode = (await client.getCode({ address: target })) ?? "0x";

  // Case 1: no code at all — plain EOA.
  if (rawCode === "0x" || rawCode.length <= 2) {
    return { ok: true, check: { status: "plain-eoa", address: target } };
  }

  // Case 2: has code but not a delegation. Regular contract.
  const codeSize = (rawCode.length - 2) / 2;
  const hasDelegationPrefix =
    rawCode.toLowerCase().startsWith(DELEGATION_PREFIX) &&
    codeSize === DELEGATION_CODE_LENGTH;

  if (!hasDelegationPrefix) {
    return {
      ok: true,
      check: { status: "contract", address: target, codeSize },
    };
  }

  // Case 3: delegated. Extract the delegate, then check its code.
  //   rawCode = 0xef0100 + 20-byte address = 46 hex chars after 0x.
  const delegate = getAddress(("0x" + rawCode.slice(8)) as Address);
  const delegateCode = (await client.getCode({ address: delegate })) ?? "0x";
  const delegateCodeSize = delegateCode === "0x" ? 0 : (delegateCode.length - 2) / 2;

  const { risk, reason, delegateName, attribution } = assessDelegate(
    delegate,
    delegateCodeSize,
  );

  return {
    ok: true,
    check: {
      status: "delegated",
      address: target,
      delegate,
      rawCode: rawCode as Hex,
      risk,
      delegateName,
      reason,
      delegateCodeSize,
      attribution,
    },
  };
}
