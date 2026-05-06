import { Tool, getOtherTools } from "@/lib/tools";
import Link from "next/link";

type ToolPageLayoutProps = {
  tool: Tool;
  children: React.ReactNode; // the actual tool UI plugs in here
};

export function ToolPageLayout({ tool, children }: ToolPageLayoutProps) {
  const otherTools = getOtherTools(tool.slug);

  return (
    <main className="min-h-screen">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.name,
            description: tool.metaDescription,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Person",
              name: "Mide Sofek",
              url: "https://midesofek.com",
            },
          }),
        }}
      />
      {/* Hero */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <Link
            href="/"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>{tool.name}</span>
        </nav>
        <h1 className="text-4xl font-bold mb-4">{tool.name}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          {tool.shortDescription}
        </p>
      </section>

      {/* Tool UI */}
      <section className="px-6 max-w-5xl mx-auto">{children}</section>

      {/* Cross-links to other tools */}
      {otherTools.length > 0 && (
        <section className="px-6 py-16 max-w-5xl mx-auto border-t border-gray-200 dark:border-gray-800 mt-16">
          <h2 className="text-2xl font-semibold mb-6">Explore more tools</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {otherTools.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <div className="text-2xl mb-2">{t.icon}</div>
                <h3 className="font-semibold mb-1">{t.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
