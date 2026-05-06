import { getTool } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { QRGenerator } from "./QRGenerator";

const SLUG = "qr-code-generator";

export default function QRCodeGeneratorPage() {
  const tool = getTool(SLUG);
  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <QRGenerator />
    </ToolPageLayout>
  );
}
