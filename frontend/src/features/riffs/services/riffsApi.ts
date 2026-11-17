import { ApiError } from '@/features/studio/services/projectsApi';
import type { Riff, RiffContent, RiffTiming, RiffVersion } from '../types';

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
  keepalive = false,
): Promise<Riff> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    keepalive,
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
  // Timing saves are debounced and can still be on their way out as the page
  // closes; keepalive lets them outlive it. Browsers cap keepalive bodies at
  // 64 KiB in total, so it is kept off saves that carry text.
  const timingOnly = Object.keys(changes).every(
    key => key === 'start' || key === 'end',
  );
  return sendRiff(
    `${riffsUrl(projectId)}/${riffId}`,
    'PATCH',
    changes,
    'Could not save the riff',
    timingOnly,
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

const versionsUrl = (riffId: string) => `/api/v1/riffs/${riffId}/versions`;

interface RiffVersionDTO extends Omit<RiffVersion, 'styling'> {
  styling: RiffVersion['styling'] | null;
}

/** Every saved version of a riff, newest first. */
export async function fetchRiffVersions(
  riffId: string,
): Promise<RiffVersion[]> {
  const res = await fetch(versionsUrl(riffId), { credentials: 'include' });
  if (!res.ok)
    throw new ApiError(
      `Could not load the revision history (${res.status})`,
      res.status,
    );
  const data = (await res.json()) as { versions: RiffVersionDTO[] };
  return data.versions.map(version => ({
    ...version,
    styling: version.styling ?? {},
  }));
}

/**
 * Makes an older version current again. History is never rewritten: the API
 * copies that version's text and styling into a new version and returns the riff.
 */
export async function restoreRiffVersion(
  riffId: string,
  versionId: string,
): Promise<Riff> {
  const res = await fetch(`${versionsUrl(riffId)}/${versionId}/restore`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok)
    throw new ApiError(
      `Could not restore that version (${res.status})`,
      res.status,
    );
  const data = (await res.json()) as { riff: RiffDTO };
  return toRiff(data.riff);
}
