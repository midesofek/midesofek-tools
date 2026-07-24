import { getTool } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { generateToolMetadata } from "@/lib/seo";
import { SignatureVerifier } from "./SignatureVerifier";
// import { FAQSection } from "@/components/tool-page/FAQSection";
// import { ethereumSignatureVerifierContent } from "@/content/tools/ethereum-signature-verifier";

const SLUG = "ethereum-signature-verifier";

export const metadata = generateToolMetadata(SLUG);

export default function EthereumSignatureVerifierPage() {
  const tool = getTool(SLUG);
  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <div className="py-8">
        <SignatureVerifier />
      </div>
      {/* <FAQSection faqs={ethereumSignatureVerifierContent.faqs} /> */}
    </ToolPageLayout>
  );
}
