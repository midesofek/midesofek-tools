import { getTool } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { generateToolMetadata } from "@/lib/seo";
import { ReceiptForm } from "./components/ReceiptForm";

const SLUG = "onchain-receipt-generator";

export const metadata = generateToolMetadata(SLUG);

export default function OnchainReceiptGeneratorPage() {
  const tool = getTool(SLUG);
  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <ReceiptForm />
    </ToolPageLayout>
  );
}
