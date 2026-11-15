import type { Riff } from '../types';

interface RiffDTO extends Omit<Riff, 'title' | 'styling'> {
  title: string | null;
  styling: Riff['styling'] | null;
}

interface FetchRiffsResponse {
  riffs: RiffDTO[];
}

function toRiff(dto: RiffDTO): Riff {
  return { ...dto, title: dto.title ?? '', styling: dto.styling ?? {} };
}

export async function fetchRiffsForProject(projectId: string): Promise<Riff[]> {
  const res = await fetch(`/api/v1/projects/${projectId}/riffs`, {
    credentials: 'include',
  });
  if (!res.ok)
    throw new Error(
      `Failed to load riffs for project ${projectId}: ${res.status}`,
    );
  const data = (await res.json()) as FetchRiffsResponse;
  return data.riffs.map(toRiff);
}
