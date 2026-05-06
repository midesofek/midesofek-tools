import type { ToolContent } from "@/content/tools/qr-code-generator";

export function HistorySection({
  history,
}: {
  history: NonNullable<ToolContent["history"]>;
}) {
  return (
    <section className="py-16 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-semibold mb-6">{history.heading}</h2>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 max-w-2xl">
        {history.paragraphs.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
