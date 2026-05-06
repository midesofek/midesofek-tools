export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Built by{" "}
          <a
            href="https://midesofek.com"
            className="underline hover:text-gray-900 dark:hover:text-gray-100"
          >
            @midesofek
          </a>{" "}
          |{" "}
          <a
            href="https://x.com/midesofek"
            className="underline hover:text-gray-900 dark:hover:text-gray-100"
          >
            X
          </a>{" "}
          . Open source on{" "}
          <a
            href="https://github.com/midesofek/midesofek-tools"
            className="underline hover:text-gray-900 dark:hover:text-gray-100"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
