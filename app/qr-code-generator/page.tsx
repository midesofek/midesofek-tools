import { getTool } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { QRGenerator } from "./QRGenerator";
import { generateToolMetadata } from "@/lib/seo";

const SLUG = "qr-code-generator";

export const metadata = generateToolMetadata(SLUG);

export default function QRCodeGeneratorPage() {
  const tool = getTool(SLUG);
  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <QRGenerator />
    </ToolPageLayout>
  );
}
