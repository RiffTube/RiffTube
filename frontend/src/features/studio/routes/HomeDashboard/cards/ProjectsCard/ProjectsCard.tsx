import { Link } from 'react-router-dom';
import { useProjects } from '@/features/studio/hooks';
import type { ProjectDTO } from '@/features/studio/services/projectsApi';

/** The signed-in user's own projects, most recently updated first. */
export default function ProjectsCard() {
  const { data: projects, isPending, isError } = useProjects();

  return (
    <section className="rounded-[8px] border border-rule-dark bg-charcoal p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-[22px] leading-tight font-semibold text-paper">
          Your projects
        </h2>
        <Link
          to="/dashboard/projects/new"
          className="inline-flex h-9 shrink-0 items-center rounded-[6px] border border-strong-outline px-3 text-sm font-medium text-paper transition-colors hover:border-smoke hover:bg-white/5"
        >
          New project
        </Link>
      </div>

      {isPending ? (
        <SkeletonList />
      ) : isError ? (
        <p role="alert" className="text-base text-muted-dark">
          Couldn’t load your projects. Try refreshing the page.
        </p>
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="-mx-2 space-y-1">
          {projects.map(project => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ProjectRow({ project }: { project: ProjectDTO }) {
  return (
    <li>
      <Link
        to={`/dashboard/projects/${project.id}`}
        className="group grid grid-cols-[112px_1fr] items-center gap-4 rounded-[6px] p-2 transition-colors hover:bg-white/5"
        title={project.title}
      >
        <div className="relative aspect-video w-28 overflow-hidden rounded-[8px] bg-surface-3">
          {project.videoId ? (
            <img
              src={`https://i.ytimg.com/vi/${project.videoId}/mqdefault.jpg`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
          )}
        </div>

        <div className="min-w-0">
          <p className="line-clamp-2 text-base leading-snug font-semibold text-paper">
            {project.title}
          </p>
          {project.updatedAt && (
            <p className="mt-1 text-sm leading-snug text-muted-dark tabular-nums">
              Updated {formatDate(project.updatedAt)}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function EmptyState() {
  return (
    <p className="text-base text-muted-dark">
      No projects yet.{' '}
      <Link
        to="/dashboard/projects/new"
        className="rounded-[2px] font-medium text-paper underline underline-offset-4 hover:text-gold"
      >
        Create your first project
      </Link>
      .
    </p>
  );
}

function SkeletonList() {
  return (
    <ul className="-mx-2 space-y-1" aria-label="Loading projects">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="grid grid-cols-[112px_1fr] items-center gap-4 p-2"
        >
          <div className="relative aspect-video w-28 animate-pulse overflow-hidden rounded-[8px] bg-surface-3" />
          <div className="space-y-2">
            <div className="h-3 w-48 max-w-full animate-pulse rounded bg-surface-3" />
            <div className="h-3 w-28 animate-pulse rounded bg-surface-3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
