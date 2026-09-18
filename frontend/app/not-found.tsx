import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <h2 className="text-2xl font-bold font-heading text-forest-900 dark:text-forest-100">
        Page Not Found
      </h2>
      <p className="text-sm text-warm-inkMuted dark:text-forest-300">
        The requested agronomic resource or page could not be found.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-forest-800 text-warm-bg rounded-lg text-xs font-semibold hover:bg-forest-900 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
