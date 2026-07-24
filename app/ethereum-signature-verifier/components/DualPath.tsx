import { cn } from "@/lib/utils";
import { CheckIcon, InfoIcon, XIcon } from "./icons";
import type { DualPathResult } from "../types";

export function DualPath({ result }: { result: DualPathResult }) {
  const smartAccountValid = result.smartAccountResult.status === "valid";

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        <PathCard title="As EOA" status={result.eoaResult.status} detail={result.eoaResult.detail} />
        <PathCard
          title="As smart account"
          status={result.smartAccountResult.status}
          detail={result.smartAccountResult.detail}
        />
      </div>
      <div className="mt-3 rounded-xl border border-brand/34 border-l-[3px] border-l-brand bg-brand/7 px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          <InfoIcon className="size-4.25 text-brand mt-px flex-shrink-0" />
          <p className="text-[13.5px] leading-relaxed text-foreground">
            These disagree. A verifying dapp that calls{" "}
            <span className="font-mono text-[12.5px]">isValidSignature</span> will honour the{" "}
            <strong>smart-account</strong> result — so the login will be treated as{" "}
            <strong className={smartAccountValid ? "text-success" : "text-danger"}>
              {smartAccountValid ? "Valid" : "Invalid"}
            </strong>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function PathCard({
  title,
  status,
  detail,
}: {
  title: string;
  status: "valid" | "invalid";
  detail: string;
}) {
  const isValid = status === "valid";
  return (
    <div className="rounded-xl border border-border bg-card-hover p-4">
      <div className="font-mono text-[10.5px] tracking-[0.07em] uppercase text-faint mb-3">{title}</div>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex-shrink-0 size-7.5 rounded-full inline-flex items-center justify-center",
            isValid ? "bg-success/16 text-success" : "bg-danger/15 text-danger",
          )}
        >
          {isValid ? (
            <CheckIcon className="size-4" strokeWidth={3} />
          ) : (
            <XIcon className="size-3.75" strokeWidth={2.8} />
          )}
        </span>
        <span className={cn("font-heading text-xl font-semibold", isValid ? "text-success" : "text-danger")}>
          {isValid ? "Valid" : "Invalid"}
        </span>
      </div>
      <div className="font-mono text-xs text-muted-fg mt-3 leading-relaxed whitespace-pre-line">{detail}</div>
    </div>
  );
}
