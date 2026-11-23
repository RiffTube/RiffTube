import type { ChannelAnalytics } from '../../fixtures';

/*
 * One panel, three metrics divided by fine rules. Top video gets the widest
 * cell because its value is a title rather than a number.
 */
const grid =
  'grid grid-cols-2 border-t border-rule-dark sm:grid-cols-[1fr_1fr_1.6fr]';
const cell = 'min-w-0 py-4 sm:px-5 sm:first:pl-0 sm:last:pr-0';
const divided = 'sm:border-l sm:border-rule-dark';

export default function ChannelAnalyticsCard({
  data,
}: {
  data: ChannelAnalytics | null;
}) {
  return (
    <section className="rounded-[8px] border border-rule-dark bg-charcoal p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-paper">
        Channel analytics
      </h2>

      {data === null ? (
        <Skeleton />
      ) : (
        <dl className={grid}>
          <Stat label="Subscribers" value={data.subscribers} />
          <Stat
            label="Views"
            value={data.views}
            className={`border-l border-rule-dark pl-5 ${divided}`}
          />
          <TopVideo
            id={data.topVideo?.id ?? null}
            title={data.topVideo?.title ?? null}
          />
        </dl>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  className = '',
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`${cell} ${className}`}>
      <dt className="text-sm text-muted-dark">{label}</dt>
      <dd className="mt-1 text-[28px] leading-tight font-bold text-paper tabular-nums">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

function TopVideo({ id, title }: { id: string | null; title: string | null }) {
  return (
    <div
      className={`col-span-2 border-t border-rule-dark sm:col-span-1 sm:border-t-0 ${cell} ${divided}`}
    >
      <dt className="text-sm text-muted-dark">Top video</dt>
      <dd className="mt-1">
        {id && title ? (
          <a
            href={`/studio/${id}`}
            className="line-clamp-2 rounded-[2px] text-base leading-snug font-semibold text-paper underline-offset-4 transition-colors hover:text-gold hover:underline"
          >
            {title}
          </a>
        ) : (
          <span className="text-base text-muted-dark">—</span>
        )}
      </dd>
    </div>
  );
}

function Skeleton() {
  return (
    <div className={grid} aria-busy="true">
      <div className={`${cell} animate-pulse`}>
        <div className="h-3 w-20 rounded bg-surface-3" />
        <div className="mt-2 h-7 w-16 rounded bg-surface-3" />
      </div>
      <div
        className={`${cell} animate-pulse border-l border-rule-dark pl-5 ${divided}`}
      >
        <div className="h-3 w-14 rounded bg-surface-3" />
        <div className="mt-2 h-7 w-24 rounded bg-surface-3" />
      </div>
      <div
        className={`col-span-2 animate-pulse border-t border-rule-dark sm:col-span-1 sm:border-t-0 ${cell} ${divided}`}
      >
        <div className="h-3 w-16 rounded bg-surface-3" />
        <div className="mt-2 h-5 w-40 max-w-full rounded bg-surface-3" />
      </div>
    </div>
  );
}
