import { getTool } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { generateToolMetadata } from "@/lib/seo";
import { AddressChecker } from "./components/AddressChecker";
import { Suspense } from "react";
import { AboutSection } from "@/components/tool-page/AboutSection";
import { FAQSection } from "@/components/tool-page/FAQSection";
import { eip7702DecoderContent } from "@/content/tools/eip-7702-decoder";
import { SYNC_META } from "./lib/known-delegates";

const SLUG = "eip-7702-decoder";

export const metadata = generateToolMetadata(SLUG);

export default function Eip7702DecoderPage() {
  const tool = getTool(SLUG);
  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <Suspense fallback={<CheckerSkeleton />}>
        <AddressChecker />
      </Suspense>
      <AboutSection about={eip7702DecoderContent.about} />
      <FAQSection faqs={eip7702DecoderContent.faqs} />
      <DataSourceFooter />
    </ToolPageLayout>
  );
}

function DataSourceFooter() {
  const syncedAt = SYNC_META.syncedAt
    ? new Date(SYNC_META.syncedAt).toUTCString()
    : "pending first sync";

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
        Data source
      </h3>
      <p className="leading-relaxed">
        Delegate classifications are sourced from{" "}
        <a
          href={SYNC_META.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-200"
        >
          {SYNC_META.source}
        </a>
        &apos;s hand-curated categorization table on Dune Analytics (query{" "}
        <a
          href="https://dune.com/queries/5145294"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-200"
        >
          5145294
        </a>
        ). We sync nightly via GitHub Actions and treat their tags as flags,
        not verdicts. This tool currently knows about{" "}
        <span className="font-mono">{SYNC_META.entryCount}</span> delegate
        contracts.
      </p>
      <p className="mt-2 text-xs">Last synced: {syncedAt}</p>
    </section>
  );
}

function CheckerSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 py-8">
      <div className="space-y-3">
        <div className="h-4 w-32 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
      </div>
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12" />
    </div>
  );
}
