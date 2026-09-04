/**
 * Shown while a country page renders.
 *
 * Only the seven researched markets are prerendered; every other country is
 * rendered on demand the first time anyone asks for it. Without this boundary
 * Next holds the old page on screen with no feedback at all, so switching
 * country looked like the site had frozen.
 *
 * The shape deliberately mirrors the real pages — a heading, a couple of lines,
 * then a card grid — so the layout does not jump when the content lands.
 */
export default function CountryLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="sr-only">Loading…</span>

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--text-secondary)]">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 animate-spin text-brand-500"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-20"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Switching country…
        </div>

        <div className="skeleton h-9 w-3/4 rounded-xl" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-5/6 rounded-lg" />
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-3 p-5">
            <div className="skeleton h-11 w-11 rounded-xl" />
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="mt-2 skeleton h-3 w-1/3 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
