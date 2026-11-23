import type { ExploreRecommendation } from '../../fixtures';

export default function ExploreRecommendationsCard({
  items,
}: {
  items: ExploreRecommendation[] | null;
}) {
  return (
    <section className="rounded-[8px] border border-rule-dark bg-charcoal p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-paper">Explore</h2>
        <a
          href="/explore"
          className="inline-flex h-9 items-center rounded-[6px] px-2 text-sm font-medium text-muted-dark transition-colors hover:bg-white/5 hover:text-paper"
        >
          See all
        </a>
      </div>

      {items === null ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="-mx-2 space-y-1">
          {items.map(r => (
            <li key={r.id}>
              <a
                href={`/explore?rec=${r.id}`}
                className="group grid grid-cols-[112px_1fr] items-center gap-4 rounded-[6px] p-2 transition-colors hover:bg-white/5 md:grid-cols-[96px_1fr] md:gap-3 lg:grid-cols-[112px_1fr] lg:gap-4"
                aria-label={`${r.title} by ${r.author}`}
                title={r.title}
              >
                {/* thumb */}
                <div className="relative aspect-video w-28 overflow-hidden rounded-[8px] bg-surface-3 md:w-24 lg:w-28">
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
                  <p className="line-clamp-2 text-base leading-snug font-semibold text-paper">
                    {r.title}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-muted-dark">
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
    <p className="text-base text-muted-dark">
      Nothing to recommend yet.{' '}
      <a
        href="/explore"
        className="rounded-[2px] font-medium text-paper underline underline-offset-4 hover:text-gold"
      >
        Browse Explore
      </a>
      .
    </p>
  );
}

function SkeletonList() {
  return (
    <ul className="-mx-2 space-y-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="grid grid-cols-[112px_1fr] items-center gap-4 p-2 md:grid-cols-[96px_1fr] md:gap-3 lg:grid-cols-[112px_1fr] lg:gap-4"
        >
          <div className="relative aspect-video w-28 animate-pulse overflow-hidden rounded-[8px] bg-surface-3 md:w-24 lg:w-28" />
          <div className="space-y-2">
            <div className="h-3 w-40 max-w-full animate-pulse rounded bg-surface-3" />
            <div className="h-3 w-24 animate-pulse rounded bg-surface-3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
