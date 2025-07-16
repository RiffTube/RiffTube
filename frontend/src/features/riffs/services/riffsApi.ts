import type { Riff } from '../components/RiffOverlay';

export interface FetchRiffsResponse {
  riffs: Riff[];
}

export async function fetchRiffsForProject(
  projectId: string,
): Promise<FetchRiffsResponse> {
  const res = await fetch(`/api/v1/projects/${projectId}/riffs`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load riffs');
  const data = (await res.json()) as FetchRiffsResponse;
  return data;
}
