"use client";

import { useEffect, useMemo, useState } from "react";
import { InputPanel } from "./InputPanel";
import { ResultPanel } from "./ResultPanel";
import { buildAllDigests, detectMessageType } from "./lib/digest";
import { verifyEOA, type EoaVerification } from "./lib/eoa";
import type { ChainId, MessageMode, SingleVerificationResult, VerificationResult } from "./types";

const CHAIN_IDS: ChainId[] = ["ethereum", "base", "arbitrum", "optimism", "polygon"];

/** Reuses the existing valid/invalid UI states — no new result shape needed. */
function mapEoaResult(result: EoaVerification): SingleVerificationResult {
  if (result.status === "valid") {
    return {
      status: "valid",
      path: "eoa",
      accountKind: "eoa",
      pathLabel: "EOA",
      summary: "The signature recovers the address you entered — it's authentic.",
      trace: result.trace,
      findings: result.findings,
    };
  }

  return {
    status: "invalid",
    path: "eoa",
    accountKind: "eoa",
    pathLabel: "EOA",
    summary: result.reason,
    trace: result.trace,
    findings: result.findings,
    // Only a mismatch has a recovered address to compare — a bad address or
    // malformed signature has nothing to show a comparison block for.
    addresses: result.recovered
      ? { claimed: result.claimed, recovered: result.recovered, recoveredNote: "Likely your other wallet." }
      : undefined,
  };
}

export function SignatureVerifier() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [messageMode, setMessageMode] = useState<MessageMode>("text");
  const [userOverrode, setUserOverrode] = useState(false);
  const [signature, setSignature] = useState("");
  const [chains, setChains] = useState<Set<ChainId>>(new Set<ChainId>(["base"]));
  const [rpcUrl, setRpcUrl] = useState("");
  const [rpcOpen, setRpcOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<EoaVerification | null>(null);

  function handleMessageChange(value: string) {
    setMessage(value);
    if (!value.trim()) {
      // Clearing the field resets stickiness — detection resumes on the next input.
      setUserOverrode(false);
      setMessageMode(detectMessageType(value));
      return;
    }
    if (!userOverrode) {
      setMessageMode(detectMessageType(value));
    }
  }

  function handleMessageModeChange(mode: MessageMode) {
    setMessageMode(mode);
    setUserOverrode(true);
  }

  // Phase 2: the digest layer. Live, synchronous, offline — the state shown
  // whenever there's a message but no signature yet.
  const digestResult: VerificationResult | null = useMemo(() => {
    if (!message.trim()) return null;
    const { detected, results } = buildAllDigests(message);
    return {
      status: "digest",
      detected,
      active: messageMode,
      results,
      findings: results[messageMode].findings ?? [],
    };
  }, [message, messageMode]);

  // Phase 3: EOA verification. viem's recover is async but hits no network,
  // so this still reads as live — the cancelled guard only protects against
  // a stale response landing after a fast edit.
  useEffect(() => {
    // Nothing to reset when inputs are empty: `hasVerdict` below already
    // makes `result` ignore a stale `verifyResult` in that case.
    if (!message.trim() || !signature.trim()) return;
    let cancelled = false;
    verifyEOA({ address, message, mode: messageMode, signature }).then((r) => {
      if (!cancelled) setVerifyResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [address, message, messageMode, signature]);

  const hasVerdict = Boolean(message.trim() && signature.trim());

  const result: VerificationResult | null = useMemo(() => {
    if (hasVerdict && verifyResult) return mapEoaResult(verifyResult);
    return digestResult;
  }, [hasVerdict, verifyResult, digestResult]);

  function toggleChain(id: ChainId) {
    setChains((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleVerify() {
    console.log("verify:stub", {
      address,
      message,
      messageMode,
      signature,
      chains: Array.from(chains),
      rpcUrl: rpcUrl || undefined,
    });
  }

  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-[2fr_3fr] gap-6 items-start">
      <InputPanel
        address={address}
        onAddressChange={setAddress}
        message={message}
        onMessageChange={handleMessageChange}
        messageMode={messageMode}
        onMessageModeChange={handleMessageModeChange}
        messageModeSource={userOverrode ? "manual" : "auto"}
        signature={signature}
        onSignatureChange={setSignature}
        showChains={!hasVerdict}
        chainIds={CHAIN_IDS}
        selectedChains={chains}
        onToggleChain={toggleChain}
        rpcUrl={rpcUrl}
        onRpcUrlChange={setRpcUrl}
        rpcOpen={rpcOpen}
        onToggleRpcOpen={() => setRpcOpen((v) => !v)}
        onVerify={handleVerify}
      />
      <ResultPanel result={result} />
    </div>
  );
}
