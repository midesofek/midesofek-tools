import type { ToolContent } from "@/content/tools/qr-code-generator";

export function FAQSection({ faqs }: { faqs: ToolContent["faqs"] }) {
  // Build FAQPage JSON-LD
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <section className="py-16 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-semibold mb-8">
        Frequently asked questions
      </h2>
      <div className="space-y-6 max-w-3xl">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group border-b border-gray-200 dark:border-gray-800 pb-4"
          >
            <summary className="cursor-pointer font-medium flex justify-between items-center list-none">
              <span>{faq.question}</span>
              <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl">
                +
              </span>
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
