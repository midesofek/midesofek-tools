import { getTool } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { generateToolMetadata } from "@/lib/seo";
import { ReceiptForm } from "./components/ReceiptForm";
import { Suspense } from "react";
import { FAQSection } from "@/components/tool-page/FAQSection";
import { onchainReceiptGeneratorContent } from "@/content/tools/onchain-receipt-generator";

const SLUG = "onchain-receipt-generator";

export const metadata = generateToolMetadata(SLUG);

export default function OnchainReceiptGeneratorPage() {
  const tool = getTool(SLUG);
  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <Suspense fallback={<ReceiptFormSkeleton />}>
        <ReceiptForm />
      </Suspense>
      <FAQSection faqs={onchainReceiptGeneratorContent.faqs} />
    </ToolPageLayout>
  );
}

function ReceiptFormSkeleton() {
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
