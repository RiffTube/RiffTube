import { Link } from 'react-router-dom';
import { useProjects } from '@/features/studio/hooks';
import type { ProjectDTO } from '@/features/studio/services/projectsApi';

/** The signed-in user's own projects, most recently updated first. */
export default function ProjectsCard() {
  const { data: projects, isPending, isError } = useProjects();

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 sm:rounded-2xl sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold sm:text-base">Your projects</h3>
        <Link
          to="/dashboard/projects/new"
          className="rounded-full border border-white/10 px-3 py-1 text-xs hover:bg-white/5"
        >
          New project
        </Link>
      </div>

      {isPending ? (
        <SkeletonList />
      ) : isError ? (
        <p role="alert" className="text-sm text-white/70">
          Couldn’t load your projects. Try refreshing the page.
        </p>
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2">
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
        className="group grid grid-cols-[112px_1fr] items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none sm:grid-cols-[96px_1fr]"
        title={project.title}
      >
        <div className="relative aspect-video w-28 overflow-hidden rounded-lg bg-white/10 sm:w-24">
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
          <p className="line-clamp-2 text-base leading-snug font-medium sm:text-sm">
            {project.title}
          </p>
          {project.updatedAt && (
            <p className="mt-0.5 text-xs leading-snug text-white/60">
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
    <div className="rounded-lg border border-white/10 p-3 text-sm text-white/70">
      No projects yet.{' '}
      <Link to="/dashboard/projects/new" className="underline hover:text-white">
        Create your first project
      </Link>
      .
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2" aria-label="Loading projects">
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
