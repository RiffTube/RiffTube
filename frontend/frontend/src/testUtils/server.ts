import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Riff } from '@/features/riffs/types';
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
export function fakeRiffsApi(project: ProjectDTO, initial: Riff[] = []) {
  let riffs = initial.map(riff => ({ ...riff }));
  let created = 0;
  const requests: RecordedRequest[] = [];
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
      if (contentChanged) next.version = current.version + 1;

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

  return {
    handlers,
    requests,
    /** Requests of one kind, oldest first */
    sent: (method: RecordedRequest['method']) =>
      requests.filter(request => request.method === method),
    /** What the "server" holds now */
    riffs: () => riffs,
  };
}
