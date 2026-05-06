import type { ToolContent } from "@/content/tools/qr-code-generator";

export function UseCases({ useCases }: { useCases: ToolContent["useCases"] }) {
  return (
    <section className="py-16 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-semibold mb-8">Use cases</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {useCases.map((uc) => (
          <div key={uc.title}>
            <h3 className="font-semibold mb-2">{uc.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{uc.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
