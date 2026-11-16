import { http, HttpResponse } from 'msw';
import { makeRiff, server } from '@/testUtils/server';
import { createRiff, deleteRiff, RiffSaveError, updateRiff } from './riffsApi';

const riff = makeRiff({ id: 'r1' });

/** Answers every write with `riff` and notes how each request was sent. */
function recordWrites() {
  const seen: { method: string; keepalive: boolean; body: unknown }[] = [];
  const note = async (request: Request) => {
    const text = await request.text();
    seen.push({
      method: request.method,
      keepalive: request.keepalive,
      body: text ? (JSON.parse(text) as unknown) : null,
    });
  };

  server.use(
    http.post('*/api/v1/projects/p1/riffs', async ({ request }) => {
      await note(request);
      return HttpResponse.json({ riff }, { status: 201 });
    }),
    http.patch('*/api/v1/projects/p1/riffs/r1', async ({ request }) => {
      await note(request);
      return HttpResponse.json({ riff });
    }),
    http.delete('*/api/v1/projects/p1/riffs/r1', async ({ request }) => {
      await note(request);
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return seen;
}

describe('riffsApi', () => {
  it('wraps what it sends in a "riff" key', async () => {
    const seen = recordWrites();

    await createRiff('p1', { start: 1, end: 4, text: 'Hi' });

    expect(seen[0].body).toEqual({ riff: { start: 1, end: 4, text: 'Hi' } });
  });

  it('lets timing saves outlive the page, but not saves that carry text', async () => {
    const seen = recordWrites();

    await updateRiff('p1', 'r1', { start: 2, end: 5 });
    await updateRiff('p1', 'r1', { end: 6 });
    await updateRiff('p1', 'r1', { text: 'Long text '.repeat(10_000) });
    await updateRiff('p1', 'r1', { start: 2, title: 'Both' });
    await createRiff('p1', { start: 1, end: 4 });
    await deleteRiff('p1', 'r1');

    expect(seen.map(request => [request.method, request.keepalive])).toEqual([
      ['PATCH', true],
      ['PATCH', true],
      ['PATCH', false],
      ['PATCH', false],
      ['POST', false],
      ['DELETE', true],
    ]);
  });

  it('turns missing titles and styling into empty values', async () => {
    server.use(
      http.patch('*/api/v1/projects/p1/riffs/r1', () =>
        HttpResponse.json({ riff: { ...riff, title: null, styling: null } }),
      ),
    );

    const saved = await updateRiff('p1', 'r1', { start: 2 });

    expect(saved).toMatchObject({ title: '', styling: {} });
  });

  it('reports the API\u2019s field errors when a save is rejected', async () => {
    server.use(
      http.patch('*/api/v1/projects/p1/riffs/r1', () =>
        HttpResponse.json(
          { errors: { end: ['must be greater than 5.0'] } },
          { status: 422 },
        ),
      ),
    );

    const error = await updateRiff('p1', 'r1', { end: 1 }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(RiffSaveError);
    expect(error).toMatchObject({
      status: 422,
      fieldErrors: { end: ['must be greater than 5.0'] },
      message: expect.stringContaining(
        'end must be greater than 5.0',
      ) as string,
    });
  });

  it('treats deleting something already gone as done', async () => {
    server.use(
      http.delete('*/api/v1/projects/p1/riffs/r1', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );

    await expect(deleteRiff('p1', 'r1')).resolves.toBeUndefined();
  });

  it('fails when a delete is refused for another reason', async () => {
    server.use(
      http.delete('*/api/v1/projects/p1/riffs/r1', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );

    await expect(deleteRiff('p1', 'r1')).rejects.toThrow(/could not delete/i);
  });
});
