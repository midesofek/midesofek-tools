export function Findings({ findings }: { findings: string[] }) {
  if (findings.length === 0) return null;

  return (
    <div className="mt-5 pt-4.5 border-t border-border">
      <div className="font-mono text-[11px] tracking-[0.11em] uppercase text-faint mb-2.75">Findings</div>
      <div className="flex flex-wrap gap-2">
        {findings.map((finding) => (
          <span
            key={finding}
            className="inline-flex items-center gap-1.75 h-6.25 px-2.5 rounded-lg border border-border bg-card-hover font-mono text-[11.5px] text-muted-fg"
          >
            <span className="size-1.25 rounded-full bg-faint" />
            {finding}
          </span>
        ))}
      </div>
    </div>
  );
}
