"use client";

import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "./components/icons";
import type { AccountKind, ChainId, MessageMode } from "./types";

const CHAIN_LABELS: Record<ChainId, string> = {
  ethereum: "Ethereum",
  base: "Base",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  polygon: "Polygon",
};

const MESSAGE_MODE_LABELS: Record<MessageMode, string> = {
  text: "Text",
  typed: "Typed data",
  hash: "Raw hash",
};

const ACCOUNT_BADGE: Record<AccountKind, { label: string; text: string; fill: string; dot: string }> = {
  eoa: { label: "EOA", text: "text-acct-eoa", fill: "bg-acct-eoa/13 border-acct-eoa/32", dot: "bg-acct-eoa" },
  contract: {
    label: "Contract",
    text: "text-acct-contract",
    fill: "bg-acct-contract/13 border-acct-contract/32",
    dot: "bg-acct-contract",
  },
  delegated: {
    label: "Delegated EOA",
    text: "text-acct-delegated",
    fill: "bg-acct-delegated/13 border-acct-delegated/32",
    dot: "bg-acct-delegated",
  },
  undeployed: {
    label: "No code",
    text: "text-acct-none",
    fill: "bg-acct-none/13 border-acct-none/32",
    dot: "bg-acct-none",
  },
};

interface InputPanelProps {
  address: string;
  onAddressChange: (value: string) => void;
  accountKind?: AccountKind;
  message: string;
  onMessageChange: (value: string) => void;
  messageMode: MessageMode;
  onMessageModeChange: (mode: MessageMode) => void;
  signature: string;
  onSignatureChange: (value: string) => void;
  chainIds: ChainId[];
  selectedChains: Set<ChainId>;
  onToggleChain: (id: ChainId) => void;
  rpcUrl: string;
  onRpcUrlChange: (value: string) => void;
  rpcOpen: boolean;
  onToggleRpcOpen: () => void;
  onVerify: () => void;
}

export function InputPanel({
  address,
  onAddressChange,
  accountKind,
  message,
  onMessageChange,
  messageMode,
  onMessageModeChange,
  signature,
  onSignatureChange,
  chainIds,
  selectedChains,
  onToggleChain,
  rpcUrl,
  onRpcUrlChange,
  rpcOpen,
  onToggleRpcOpen,
  onVerify,
}: InputPanelProps) {
  const hexDigits = signature.replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "");
  const bytes = Math.floor(hexDigits.length / 2);
  const sigByteCountOk = bytes === 65 || bytes === 0;
  const badge = accountKind ? ACCOUNT_BADGE[accountKind] : null;

  return (
    <div className="rounded-[14px] border border-border bg-card p-5">
      <div className="font-mono text-[11px] tracking-[0.11em] uppercase text-faint mb-4.5">Inputs</div>

      <label htmlFor="sv-address" className="block text-[13px] font-semibold mb-1.75">
        Address
      </label>
      <div className="relative mb-4.5">
        <input
          id="sv-address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder="0x…"
          className={cn(
            "w-full h-10 rounded-lg border border-border bg-transparent px-3 font-mono text-[13px] text-foreground outline-none focus:border-brand",
            badge && "pr-32.5",
          )}
        />
        {badge && (
          <span
            className={cn(
              "absolute right-1.75 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 h-6 px-2.25 rounded-md border font-mono text-[11px] font-medium whitespace-nowrap",
              badge.text,
              badge.fill,
            )}
          >
            <span className={cn("size-1.25 rounded-full", badge.dot)} />
            {badge.label}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center mb-1.75">
        <label className="text-[13px] font-semibold">Message</label>
        <span className="font-mono text-[11px] text-faint">auto-detected</span>
      </div>
      <div className="flex gap-1 p-1 rounded-[10px] border border-border bg-card-hover mb-2.25">
        {(Object.keys(MESSAGE_MODE_LABELS) as MessageMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onMessageModeChange(mode)}
            className={cn(
              "flex-1 h-7 rounded-md text-[12.5px] font-medium cursor-pointer transition-colors",
              messageMode === mode ? "bg-foreground text-background" : "text-muted-fg hover:text-foreground",
            )}
          >
            {MESSAGE_MODE_LABELS[mode]}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        spellCheck={false}
        className="w-full min-h-33 rounded-lg border border-border bg-transparent px-3 py-2.75 font-mono text-xs leading-relaxed text-foreground outline-none focus:border-brand mb-4.5 resize-y"
      />

      <div className="flex justify-between items-center mb-1.75">
        <label className="text-[13px] font-semibold">Signature</label>
        <span className={cn("font-mono text-[11px]", sigByteCountOk ? "text-faint" : "text-warning")}>
          {bytes} bytes
        </span>
      </div>
      <textarea
        value={signature}
        onChange={(e) => onSignatureChange(e.target.value)}
        spellCheck={false}
        className="w-full min-h-19.5 rounded-lg border border-border bg-transparent px-3 py-2.75 font-mono text-xs leading-relaxed text-foreground outline-none focus:border-brand break-all mb-5 resize-y"
      />

      <div className="mb-3.5">
        <div className="flex justify-between items-baseline mb-2.25">
          <label className="text-[13px] font-semibold">Chains</label>
          <span className="font-mono text-[11px] text-faint">multiple = parallel fan-out</span>
        </div>
        <div className="flex flex-wrap gap-1.75">
          {chainIds.map((id) => {
            const selected = selectedChains.has(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggleChain(id)}
                aria-pressed={selected}
                className={cn(
                  "h-7.5 px-3 rounded-lg border font-mono text-xs cursor-pointer transition-colors",
                  selected
                    ? "border-brand text-brand bg-brand/12"
                    : "border-border text-muted-fg bg-transparent hover:text-foreground",
                )}
              >
                {CHAIN_LABELS[id]}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleRpcOpen}
        className="flex items-center gap-2.25 w-full bg-transparent border-none p-0 py-2.25 cursor-pointer text-muted-fg text-[13px] font-medium"
      >
        <ChevronRightIcon className={cn("size-3.25 transition-transform", rpcOpen && "rotate-90")} />
        Custom RPC URL
        <span className="ml-auto font-mono text-[11px] text-faint">optional</span>
      </button>
      {rpcOpen && (
        <input
          value={rpcUrl}
          onChange={(e) => onRpcUrlChange(e.target.value)}
          placeholder="https://mainnet.example.com/v3/…"
          spellCheck={false}
          className="w-full h-9 rounded-lg border border-border bg-transparent px-3 font-mono text-xs text-foreground outline-none focus:border-brand mt-0.5"
        />
      )}

      <button
        type="button"
        onClick={onVerify}
        className="w-full h-11 mt-3.5 rounded-[10px] border-none bg-foreground text-background font-sans text-sm font-semibold cursor-pointer tracking-[0.01em] hover:opacity-90 transition-opacity"
      >
        Verify signature
      </button>
    </div>
  );
}
