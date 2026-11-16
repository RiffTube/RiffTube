export interface CreateProjectPayload {
  title: string;
  videoId: string;
}

export interface ProjectDTO {
  id: string;
  title: string;
  videoHost: string;
  videoId: string | null;
  videoUrl: string | null;
  visibility: string;
  /** ISO timestamp; present on everything the API returns today. */
  updatedAt?: string;
}

/** A failed API call, keeping the HTTP status so callers can tell 404 from the rest. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchProjects(): Promise<ProjectDTO[]> {
  const res = await fetch('/api/v1/projects', { credentials: 'include' });
  if (!res.ok)
    throw new ApiError(`Failed to load projects: ${res.status}`, res.status);
  const data = (await res.json()) as { projects: ProjectDTO[] };
  return data.projects;
}

export async function fetchProject(projectId: string): Promise<ProjectDTO> {
  const res = await fetch(`/api/v1/projects/${projectId}`, {
    credentials: 'include',
  });
  if (!res.ok)
    throw new ApiError(
      `Failed to load project ${projectId}: ${res.status}`,
      res.status,
    );
  const data = (await res.json()) as { project: ProjectDTO };
  return data.project;
}

export interface CreateProjectResponse {
  project: ProjectDTO;
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<ProjectDTO> {
  const res = await fetch('/api/v1/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      project: {
        title: payload.title,
        video_host: 'youtube',
        video_id: payload.videoId,
        video_url: `https://www.youtube.com/watch?v=${payload.videoId}`,
      },
    }),
  });

  if (!res.ok) {
    let message = `Failed to create project: ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // response body wasn't JSON; fall back to the generic message
    }
    throw new Error(message);
  }

  const data = (await res.json()) as CreateProjectResponse;
  return data.project;
}
