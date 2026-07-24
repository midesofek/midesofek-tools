"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "./icons";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: "xs" | "sm";
}

export function CopyButton({ value, className, size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleCopy() {
    void navigator.clipboard?.writeText(value);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1300);
  }

  const dim = size === "xs" ? "size-6" : "size-7.5";
  const icon = size === "xs" ? "size-2.75" : "size-3.5";

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy"
      aria-label="Copy"
      className={cn(
        "inline-flex flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-fg cursor-pointer",
        dim,
        className,
      )}
    >
      {copied ? (
        <CheckIcon className={cn(icon, "text-success")} strokeWidth={2.6} />
      ) : (
        <CopyIcon className={icon} />
      )}
    </button>
  );
}
