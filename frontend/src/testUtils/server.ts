import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Riff, RiffVersion } from '@/features/riffs/types';
import type { ProjectDTO } from '@/features/studio/services/projectsApi';

/**
 * Shared msw server. It starts with no handlers; each test adds the ones it
 * needs with `server.use(...)` and they are reset after every test.
 */
export const server = setupServer();

export function makeProject(overrides: Partial<ProjectDTO> = {}): ProjectDTO {
  return {
    id: 'p1',
    title: 'My Project',
    videoHost: 'youtube',
    videoId: 'dQw4w9WgXcQ',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    visibility: 'private',
    updatedAt: '2026-01-15T12:00:00.000Z',
    ...overrides,
  };
}

export function makeRiff(overrides: Partial<Riff> = {}): Riff {
  return {
    id: 'r1',
    start: 5,
    end: 9,
    title: 'wait',
    text: 'Wait for it...',
    styling: {},
    version: 1,
    ...overrides,
  };
}

/** Handlers for one project and its riffs, as the Rails API returns them. */
export function projectHandlers(project: ProjectDTO, riffs: Riff[] = []) {
  return [
    http.get(`*/api/v1/projects/${project.id}`, () =>
      HttpResponse.json({ project }),
    ),
    http.get(`*/api/v1/projects/${project.id}/riffs`, () =>
      HttpResponse.json({ riffs }),
    ),
  ];
}

interface RecordedRequest {
  method: 'POST' | 'PATCH' | 'DELETE';
  /** Id of the riff the request was about (absent when creating) */
  id?: string;
  body?: Record<string, unknown>;
}

/**
 * A small stand-in for the Rails riffs API: it keeps riffs in memory, applies
 * the same rules (timing moves the riff, text/styling changes bump the version,
 * end must come after start) and records every write it receives.
 */
export function fakeRiffsApi(
  project: ProjectDTO,
  initial: Riff[] = [],
  /** Older versions per riff id, oldest first; the riff itself is the newest. */
  olderVersions: Record<string, Pick<RiffVersion, 'text' | 'styling'>[]> = {},
) {
  let riffs = initial.map(riff => ({ ...riff }));
  let created = 0;
  const requests: RecordedRequest[] = [];
  const restores: { riffId: string; versionId: string }[] = [];

  // Every riff has a history; the fake clock gives each version its own minute.
  const history = new Map<string, RiffVersion[]>();
  const addVersion = (
    riffId: string,
    content: Pick<RiffVersion, 'text' | 'styling'>,
  ) => {
    const versions = history.get(riffId) ?? [];
    const version = versions.length + 1;
    versions.push({
      id: `${riffId}-v${version}`,
      version,
      text: content.text,
      styling: content.styling,
      createdAt: new Date(Date.UTC(2026, 0, 15, 12, version)).toISOString(),
    });
    history.set(riffId, versions);
    return version;
  };
  for (const riff of riffs) {
    for (const older of olderVersions[riff.id] ?? [])
      addVersion(riff.id, older);
    riff.version = addVersion(riff.id, riff);
  }

  const base = `*/api/v1/projects/${project.id}`;

  const invalidTiming = (start: number, end: number) =>
    start < 0 || end <= start
      ? HttpResponse.json(
          { errors: { end: [`must be greater than ${start}`] } },
          { status: 422 },
        )
      : null;

  const handlers = [
    http.get(base, () => HttpResponse.json({ project })),
    http.get(`${base}/riffs`, () => HttpResponse.json({ riffs })),

    http.post(`${base}/riffs`, async ({ request }) => {
      const { riff: body } = (await request.json()) as {
        riff: Partial<Riff>;
      };
      requests.push({ method: 'POST', body });

      const rejected = invalidTiming(body.start ?? -1, body.end ?? -1);
      if (rejected) return rejected;

      const riff: Riff = {
        id: `new-${++created}`,
        start: body.start!,
        end: body.end!,
        title: body.title ?? '',
        text: body.text ?? '',
        styling: body.styling ?? {},
        version: 1,
      };
      riffs.push(riff);
      addVersion(riff.id, riff);
      return HttpResponse.json({ riff }, { status: 201 });
    }),

    http.patch(`${base}/riffs/:id`, async ({ request, params }) => {
      const id = String(params.id);
      const { riff: body } = (await request.json()) as {
        riff: Partial<Riff>;
      };
      requests.push({ method: 'PATCH', id, body });

      const current = riffs.find(riff => riff.id === id);
      if (!current)
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });

      const next = { ...current, ...body };
      const rejected = invalidTiming(next.start, next.end);
      if (rejected) return rejected;

      const contentChanged =
        next.text !== current.text ||
        JSON.stringify(next.styling) !== JSON.stringify(current.styling);
      if (contentChanged) next.version = addVersion(id, next);

      riffs = riffs.map(riff => (riff.id === id ? next : riff));
      return HttpResponse.json({ riff: next });
    }),

    http.delete(`${base}/riffs/:id`, ({ params }) => {
      const id = String(params.id);
      requests.push({ method: 'DELETE', id });
      riffs = riffs.filter(riff => riff.id !== id);
      return new HttpResponse(null, { status: 204 });
    }),
  ];

  handlers.push(
    http.get('*/api/v1/riffs/:id/versions', ({ params }) => {
      const versions = history.get(String(params.id));
      if (!versions || !riffs.some(riff => riff.id === params.id))
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      return HttpResponse.json({ versions: [...versions].reverse() });
    }),

    http.post(
      '*/api/v1/riffs/:id/versions/:versionId/restore',
      ({ params }) => {
        const riffId = String(params.id);
        const versionId = String(params.versionId);
        restores.push({ riffId, versionId });

        const current = riffs.find(riff => riff.id === riffId);
        const source = history
          .get(riffId)
          ?.find(version => version.id === versionId);
        if (!current || !source)
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });

        // Restoring copies the old content into a brand new version.
        const restored = {
          ...current,
          text: source.text,
          styling: source.styling,
          version: addVersion(riffId, source),
        };
        riffs = riffs.map(riff => (riff.id === riffId ? restored : riff));
        return HttpResponse.json({ riff: restored }, { status: 201 });
      },
    ),
  );

  return {
    handlers,
    requests,
    /** Restores asked for, oldest first */
    restores,
    /** What the "server" holds as a riff's history, oldest first */
    versions: (riffId: string) => history.get(riffId) ?? [],
    /** Requests of one kind, oldest first */
    sent: (method: RecordedRequest['method']) =>
      requests.filter(request => request.method === method),
    /** What the "server" holds now */
    riffs: () => riffs,
  };
}
