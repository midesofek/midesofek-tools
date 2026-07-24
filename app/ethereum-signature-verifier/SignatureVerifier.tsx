"use client";

import { useMemo, useState } from "react";
import { InputPanel } from "./InputPanel";
import { ResultPanel } from "./ResultPanel";
import { buildAllDigests, detectMessageType } from "./lib/digest";
import type { ChainId, MessageMode, VerificationResult } from "./types";

const CHAIN_IDS: ChainId[] = ["ethereum", "base", "arbitrum", "optimism", "polygon"];

export function SignatureVerifier() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [messageMode, setMessageMode] = useState<MessageMode>("text");
  const [userOverrode, setUserOverrode] = useState(false);
  const [signature, setSignature] = useState("");
  const [chains, setChains] = useState<Set<ChainId>>(new Set<ChainId>(["base"]));
  const [rpcUrl, setRpcUrl] = useState("");
  const [rpcOpen, setRpcOpen] = useState(false);

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

  // Phase 2: the digest layer only. Live, synchronous, offline — no reason to
  // gate this behind the Verify button. Address/signature/chains/RPC are
  // wired in the verification phase.
  const result: VerificationResult | null = useMemo(() => {
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
