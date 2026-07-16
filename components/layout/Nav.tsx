import Link from "next/link";
import { Logo } from "../Logo";
import { ThemeToggle } from "./ThemeToggle";

const GITHUB_URL = "https://github.com/midesofek/midesofek-tools";

export function Nav() {
  return (
    <nav className="border-b border-border">
      <div className="max-w-250 mx-auto px-8 py-5 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-6 font-mono text-[13px] text-muted-fg">
          <Link href="/" className="hover:text-foreground">
            Tools
          </Link>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-foreground"
          >
            <span className="w-1.75 h-1.75 rounded-full bg-star-dot" />
            Star
          </a>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
