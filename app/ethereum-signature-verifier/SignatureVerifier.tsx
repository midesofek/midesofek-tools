"use client";

import { useState } from "react";
import { InputPanel } from "./InputPanel";
import { ResultPanel } from "./ResultPanel";
import type { ChainId, MessageMode, VerificationResult } from "./types";

const CHAIN_IDS: ChainId[] = ["ethereum", "base", "arbitrum", "optimism", "polygon"];

export function SignatureVerifier() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [messageMode, setMessageMode] = useState<MessageMode>("typed");
  const [signature, setSignature] = useState("");
  const [chains, setChains] = useState<Set<ChainId>>(new Set<ChainId>(["base"]));
  const [rpcUrl, setRpcUrl] = useState("");
  const [rpcOpen, setRpcOpen] = useState(false);

  // No verification logic lives here yet — the result stays empty until a
  // later change wires up the actual EOA / ERC-1271 / EIP-6492 / EIP-7702 / Safe checks.
  const result: VerificationResult | null = null;

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
        onMessageChange={setMessage}
        messageMode={messageMode}
        onMessageModeChange={setMessageMode}
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
