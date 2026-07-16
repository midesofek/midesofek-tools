import { getLiveTools } from "@/lib/tools";
import { ToolCard } from "@/components/home/ToolCard";

export default function HomePage() {
  const liveTools = getLiveTools();
  const count = liveTools.length;

  return (
    <main className="min-h-screen">
      <div className="relative overflow-hidden">
        <div
          className="absolute -top-35 left-1/2 -translate-x-1/2 w-170 h-90 pointer-events-none"
          style={{
            background: "radial-gradient(closest-side, var(--glow), transparent)",
          }}
        />
        <div className="relative max-w-250 mx-auto px-8 pt-21 pb-15 text-center">
          <div className="font-mono text-[12.5px] tracking-widest uppercase text-eyebrow mb-5.5">
            Free · open source · no tracking
          </div>
          <h1 className="font-heading text-[58px] leading-[1.04] font-semibold tracking-[-0.03em] mx-auto mb-5 max-w-180">
            Free, Open Source
            <br />
            Utility Tools
          </h1>
          <p className="text-[19px] leading-[1.6] text-muted-fg mx-auto mb-8.5 max-w-130">
            No signup. No tracking. Nothing leaves your machine.
          </p>
          <div className="inline-flex flex-wrap gap-5.5 justify-center font-mono text-[13px] text-faint">
            <span>
              <span className="text-foreground font-semibold">{count}</span> tools live
            </span>
            <span className="opacity-40">·</span>
            <span>
              <span className="text-foreground font-semibold">MIT</span> licensed
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-250 mx-auto px-8 pb-15">
        <h2 className="font-mono text-[12.5px] font-semibold tracking-[0.12em] uppercase text-faint mb-5">
          Tools — {String(count).padStart(2, "0")}
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {liveTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </main>
  );
}
