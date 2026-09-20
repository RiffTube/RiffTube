export interface CreateProjectPayload {
  title: string;
  videoUrl: string;
}

export interface ProjectDTO {
  id: string;
  title: string;
  videoHost: string;
  videoId: string | null;
  videoUrl: string | null;
  visibility: string;
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
        video_url: payload.videoUrl,
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
