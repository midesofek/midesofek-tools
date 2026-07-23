import Link from "next/link";
import { Logo } from "../Logo";
import { ThemeToggle } from "./ThemeToggle";

const GITHUB_URL = "https://github.com/midesofek/midesofek-tools";

export function Nav() {
  return (
    <nav className="border-b border-border">
      <div className="max-w-250 mx-auto px-4.5 py-3.5 sm:px-8 sm:py-5 flex items-center justify-between gap-3">
        <Link href="/">
          <Logo className="h-7.5 sm:h-8" />
        </Link>
        <div className="flex items-center gap-2.5 sm:gap-6 font-mono text-[13px] text-muted-fg">
          <Link href="/" className="hidden sm:inline hover:text-foreground">
            Tools
          </Link>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline hover:text-foreground"
          >
            GitHub
          </a>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="star-link flex items-center gap-1.75 h-8.5 px-2.75 sm:px-3.25 rounded-full border border-border text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
            </svg>
            Star
          </a>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
