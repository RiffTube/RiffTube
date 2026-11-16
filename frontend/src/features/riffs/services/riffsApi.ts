import { ApiError } from '@/features/studio/services/projectsApi';
import type { Riff, RiffContent, RiffTiming } from '../types';

interface RiffDTO extends Omit<Riff, 'title' | 'styling'> {
  title: string | null;
  styling: Riff['styling'] | null;
}

function toRiff(dto: RiffDTO): Riff {
  return { ...dto, title: dto.title ?? '', styling: dto.styling ?? {} };
}

export type NewRiff = RiffTiming & Partial<RiffContent>;
export type RiffChanges = Partial<RiffTiming & RiffContent>;

/** A rejected save, with the API's per-field messages when it sent any (422). */
export class RiffSaveError extends ApiError {
  fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message, status);
    this.name = 'RiffSaveError';
    this.fieldErrors = fieldErrors;
  }
}

const riffsUrl = (projectId: string) => `/api/v1/projects/${projectId}/riffs`;

async function saveError(res: Response, action: string): Promise<never> {
  let fieldErrors: Record<string, string[]> = {};
  try {
    const data = (await res.json()) as { errors?: Record<string, string[]> };
    if (data?.errors) fieldErrors = data.errors;
  } catch {
    // response body wasn't JSON; the status alone will have to do
  }

  const details = Object.entries(fieldErrors)
    .map(([field, messages]) => `${field} ${messages.join(', ')}`)
    .join('; ');
  throw new RiffSaveError(
    details ? `${action}: ${details}` : `${action} (${res.status})`,
    res.status,
    fieldErrors,
  );
}

async function sendRiff(
  url: string,
  method: 'POST' | 'PATCH',
  riff: NewRiff | RiffChanges,
  action: string,
): Promise<Riff> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    // Timing saves are debounced and can still be on their way out as the
    // page closes; keepalive lets the request outlive the page.
    keepalive: true,
    body: JSON.stringify({ riff }),
  });
  if (!res.ok) return saveError(res, action);

  const data = (await res.json()) as { riff: RiffDTO };
  return toRiff(data.riff);
}

export async function fetchRiffsForProject(projectId: string): Promise<Riff[]> {
  const res = await fetch(riffsUrl(projectId), { credentials: 'include' });
  if (!res.ok)
    throw new ApiError(
      `Failed to load riffs for project ${projectId}: ${res.status}`,
      res.status,
    );
  const data = (await res.json()) as { riffs: RiffDTO[] };
  return data.riffs.map(toRiff);
}

export function createRiff(projectId: string, riff: NewRiff): Promise<Riff> {
  return sendRiff(riffsUrl(projectId), 'POST', riff, 'Could not add the riff');
}

/** Timing changes move the riff; title, text or styling changes create a new version. */
export function updateRiff(
  projectId: string,
  riffId: string,
  changes: RiffChanges,
): Promise<Riff> {
  return sendRiff(
    `${riffsUrl(projectId)}/${riffId}`,
    'PATCH',
    changes,
    'Could not save the riff',
  );
}

export async function deleteRiff(
  projectId: string,
  riffId: string,
): Promise<void> {
  const res = await fetch(`${riffsUrl(projectId)}/${riffId}`, {
    method: 'DELETE',
    credentials: 'include',
    // Deletes are sent a few seconds late (to allow undo), sometimes as the
    // page is closing; keepalive lets the request outlive the page.
    keepalive: true,
  });
  // 404 means it is already gone, which is what was asked for.
  if (!res.ok && res.status !== 404)
    throw new ApiError(`Could not delete the riff (${res.status})`, res.status);
}
