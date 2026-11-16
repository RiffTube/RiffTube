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
