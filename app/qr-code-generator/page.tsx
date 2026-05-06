import { getTool } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { QRGenerator } from "./QRGenerator";
import { generateToolMetadata } from "@/lib/seo";
import { qrCodeContent } from "@/content/tools/qr-code-generator";
import { AboutSection } from "@/components/tool-page/AboutSection";
import { FeatureGrid } from "@/components/tool-page/FeatureGrid";
import { UseCases } from "@/components/tool-page/UseCases";
import { FAQSection } from "@/components/tool-page/FAQSection";
import { HistorySection } from "@/components/tool-page/HistorySection";

const SLUG = "qr-code-generator";

export const metadata = generateToolMetadata(SLUG);

export default function QRCodeGeneratorPage() {
  const tool = getTool(SLUG);
  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <QRGenerator />
      <AboutSection about={qrCodeContent.about} />
      <FeatureGrid features={qrCodeContent.features} />
      <UseCases useCases={qrCodeContent.useCases} />
      <FAQSection faqs={qrCodeContent.faqs} />
      {qrCodeContent.history && (
        <HistorySection history={qrCodeContent.history} />
      )}
    </ToolPageLayout>
  );
}
