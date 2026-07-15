import Link from "next/link";
import { Logo } from "../Logo";

export function Nav() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Tools
          </Link>

          <a
            href="https://github.com/midesofek/midesofek-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
