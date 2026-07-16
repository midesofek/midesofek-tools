export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-250 mx-auto px-8 py-6 flex justify-between font-mono text-[12.5px] text-faint">
        <span>
          Built by{" "}
          <a
            href="https://midesofek.com"
            className="text-foreground border-b border-border"
          >
            @midesofek
          </a>
        </span>
        <span className="flex gap-4.5">
          <a href="https://x.com/midesofek">X</a>
          <a href="https://github.com/midesofek/midesofek-tools">GitHub</a>
        </span>
      </div>
    </footer>
  );
}
