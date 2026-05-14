import { getTool } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { generateToolMetadata } from "@/lib/seo";

const SLUG = "onchain-receipt-generator";

export const metadata = generateToolMetadata(SLUG);

export default function OnchainReceiptGeneratorPage() {
  const tool = getTool(SLUG);
  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <div className="p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center text-gray-500">
        Tool UI coming in Phase 3.
      </div>
    </ToolPageLayout>
  );
}
