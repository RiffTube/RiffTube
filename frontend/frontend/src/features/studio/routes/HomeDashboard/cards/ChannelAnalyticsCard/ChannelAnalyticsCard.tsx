import type { ChannelAnalytics } from '../../fixtures';

export default function ChannelAnalyticsCard({
  data,
}: {
  data: ChannelAnalytics | null;
}) {
  return (
    <section className="rounded-xl border border-strong-outline bg-reel-dust/40 p-4 sm:rounded-2xl sm:p-5">
      <h3 className="mb-3 text-lg font-semibold text-flicker-white sm:text-base">
        Channel analytics
      </h3>

      {data === null ? (
        <Skeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Subscribers" value={data.subscribers} />
          <Stat label="Views" value={data.views} />
          <TopVideo
            id={data.topVideo?.id ?? null}
            title={data.topVideo?.title ?? null}
          />
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-strong-outline bg-surface-2 p-3 sm:p-4">
      <div className="text-xs text-silver-dust">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-flicker-white tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function TopVideo({ id, title }: { id: string | null; title: string | null }) {
  return (
    <div className="col-span-2 rounded-xl border border-strong-outline bg-surface-2 p-3 sm:col-span-1 sm:p-4">
      <div className="text-xs text-silver-dust">Top video</div>
      {id && title ? (
        <a
          href={`/studio/${id}`}
          className="mt-1 block truncate text-sm text-flicker-white transition-colors hover:text-popcorn-butter"
        >
          {title}
        </a>
      ) : (
        <div className="mt-1 text-sm text-silver-dust">—</div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy="true">
      <div className="animate-pulse rounded-xl border border-strong-outline bg-surface-2 p-3 sm:p-4">
        <div className="h-3 w-20 rounded bg-surface-3" />
        <div className="mt-2 h-6 w-16 rounded bg-surface-3" />
      </div>
      <div className="animate-pulse rounded-xl border border-strong-outline bg-surface-2 p-3 sm:p-4">
        <div className="h-3 w-14 rounded bg-surface-3" />
        <div className="mt-2 h-6 w-24 rounded bg-surface-3" />
      </div>
      <div className="col-span-2 animate-pulse rounded-xl border border-strong-outline bg-surface-2 p-3 sm:col-span-1 sm:p-4">
        <div className="h-3 w-16 rounded bg-surface-3" />
        <div className="mt-2 h-5 w-40 rounded bg-surface-3" />
      </div>
    </div>
  );
}
