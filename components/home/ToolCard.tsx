import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { isNewTool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const isNew = isNewTool(tool);

  return (
    <Link
      href={`/${tool.slug}`}
      className={`block p-6 rounded-[14px] bg-card border transition-[border-color,background-color] duration-150 hover:border-brand hover:bg-card-hover ${
        isNew ? "border-tile-border shadow-[0_0_0_1px_var(--tile-border)]" : "border-border"
      }`}
    >
      <div className="flex justify-between items-start mb-7">
        <span className="w-11.5 h-11.5 rounded-[11px] bg-tile-bg border border-tile-border flex items-center justify-center font-mono font-semibold text-sm text-tile-text">
          {tool.code}
        </span>
        {isNew && (
          <span className="font-mono text-[10.5px] font-semibold tracking-wide text-tile-text border border-tile-border bg-tile-bg rounded-full px-2.5 py-0.75">
            NEW
          </span>
        )}
      </div>
      <div className="font-heading text-lg font-semibold mb-1.75">{tool.name}</div>
      <p className="text-sm leading-[1.55] text-muted-fg">{tool.shortDescription}</p>
    </Link>
  );
}
