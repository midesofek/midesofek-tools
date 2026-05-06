import type { ToolContent } from "@/content/tools/qr-code-generator";

export function FeatureGrid({
  features,
}: {
  features: ToolContent["features"];
}) {
  return (
    <section className="py-16 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-semibold mb-8">Features</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="space-y-2">
            {f.icon && <div className="text-2xl">{f.icon}</div>}
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
