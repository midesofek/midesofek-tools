import Link from "next/link";
import { tools } from "@/lib/tools";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      <header className="mb-16">
        <h1 className="text-4xl font-bold mb-4">midesofek-tools</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Free, open-source utility tools. No signup, no tracking, runs in your
          browser.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                {tool.name}
                {tool.status !== "live" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {tool.status === "coming-soon" ? "Coming soon" : "Beta"}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.shortDescription}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
