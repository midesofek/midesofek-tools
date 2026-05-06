import type { ToolContent } from "@/content/tools/qr-code-generator";

export function AboutSection({ about }: { about: ToolContent["about"] }) {
  return (
    <section className="py-16 border-t border-gray-200 dark:border-gray-800 mt-16">
      <h2 className="text-2xl font-semibold mb-6">{about.heading}</h2>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 max-w-2xl">
        {about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
