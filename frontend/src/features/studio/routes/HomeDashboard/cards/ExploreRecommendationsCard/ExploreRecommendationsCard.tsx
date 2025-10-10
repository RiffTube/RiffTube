import type { ExploreRecommendation } from '../../fixtures';

export default function ExploreRecommendationsCard({
  items,
}: {
  items: ExploreRecommendation[] | null;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 sm:rounded-2xl sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold sm:text-base">Explore</h3>
        <a
          href="/explore"
          className="rounded-full border border-white/10 px-3 py-1 text-xs hover:bg-white/5"
        >
          See all
        </a>
      </div>

      {items === null ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2">
          {items.map(r => (
            <li key={r.id}>
              <a
                href={`/explore?rec=${r.id}`}
                className="group grid grid-cols-[112px_1fr] items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none sm:grid-cols-[96px_1fr]"
                aria-label={`${r.title} by ${r.author}`}
                title={r.title}
              >
                {/* thumb */}
                <div className="relative aspect-video w-28 overflow-hidden rounded-lg bg-white/10 sm:w-24">
                  {r.thumbnailUrl ? (
                    <img
                      src={r.thumbnailUrl}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
                  )}
                </div>

                {/* text */}
                <div className="min-w-0">
                  <p className="line-clamp-2 text-base leading-snug font-medium sm:text-sm">
                    {r.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-white/60">
                    by {r.author}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-white/10 p-3 text-sm text-white/70">
      Nothing to recommend yet.{' '}
      <a href="/explore" className="underline hover:text-white">
        Browse Explore
      </a>
      .
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="grid grid-cols-[112px_1fr] items-center gap-3 rounded-lg px-2 py-2 sm:grid-cols-[96px_1fr]"
        >
          <div className="relative aspect-video w-28 animate-pulse overflow-hidden rounded-lg bg-white/10 sm:w-24" />
          <div className="space-y-2">
            <div className="h-3 w-56 animate-pulse rounded bg-white/10 sm:w-48" />
            <div className="h-3 w-32 animate-pulse rounded bg-white/10 sm:w-28" />
          </div>
        </li>
      ))}
    </ul>
  );
}
