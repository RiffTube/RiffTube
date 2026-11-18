import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import type { RiffVersion } from '@/features/riffs/types';
import { renderWithQuery } from '@/testUtils/renderWithQuery';
import { server } from '@/testUtils/server';
import RevisionPanel from './RevisionPanel';

const version = (number: number, text: string, styling = {}): RiffVersion => ({
  id: `r1-v${number}`,
  version: number,
  text,
  styling,
  createdAt: `2026-01-15T12:0${number}:00.000Z`,
});

const first = version(1, 'First draft');
const second = version(2, 'Second thoughts', { fontSize: 24 });
const third = version(3, 'Final answer');

/** Serves this history, newest first as the API does, and counts the requests. */
function serveHistory(versions: RiffVersion[] = [third, second, first]) {
  const calls = { count: 0 };
  server.use(
    http.get('*/api/v1/riffs/r1/versions', () => {
      calls.count += 1;
      return HttpResponse.json({ versions });
    }),
  );
  return calls;
}

function renderPanel(props: Partial<Parameters<typeof RevisionPanel>[0]> = {}) {
  const onPreview = vi.fn();
  const onRestore = vi.fn(() => Promise.resolve(true));
  const view = renderWithQuery(
    <RevisionPanel
      riff={{ id: 'r1', version: 3 }}
      previewed={null}
      onPreview={onPreview}
      onRestore={onRestore}
      isRestoring={false}
      {...props}
    />,
  );
  return { onPreview, onRestore, user: userEvent.setup(), ...view };
}

const toggle = () => screen.getByRole('button', { name: /revision history/i });

describe('<RevisionPanel />', () => {
  it('starts closed and asks for nothing until it is opened', async () => {
    const calls = serveHistory();
    const { user } = renderPanel();

    // Long enough for a request to have arrived, had one been sent
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('radio')).toBeNull();
    expect(calls.count).toBe(0);

    await user.click(toggle());

    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findAllByRole('radio')).toHaveLength(3);
    expect(calls.count).toBe(1);
  });

  it('says it is loading while the history is on its way', async () => {
    let finish = () => {};
    const waiting = new Promise<void>(resolve => {
      finish = resolve;
    });
    server.use(
      http.get('*/api/v1/riffs/r1/versions', async () => {
        await waiting;
        return HttpResponse.json({ versions: [third] });
      }),
    );
    const { user } = renderPanel();

    await user.click(toggle());
    expect(screen.getByRole('status')).toHaveTextContent(/loading history/i);

    finish();
    expect(await screen.findByRole('radio')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('lists every version newest first, with the current one chosen', async () => {
    serveHistory();
    const { user } = renderPanel();

    await user.click(toggle());

    const options = await screen.findAllByRole('radio');
    expect(options.map(option => option.closest('label')?.textContent)).toEqual(
      [
        expect.stringMatching(/^Version 3 \(current\).*Final answer$/),
        expect.stringMatching(/^Version 2.*Second thoughts$/),
        expect.stringMatching(/^Version 1.*First draft$/),
      ],
    );
    expect(options.map(option => (option as HTMLInputElement).checked)).toEqual(
      [true, false, false],
    );
    expect(screen.queryByRole('button', { name: /restore/i })).toBeNull();
  });

  it('says "No text" for a version that had none', async () => {
    serveHistory([version(1, '   ')]);
    const { user } = renderPanel({ riff: { id: 'r1', version: 1 } });

    await user.click(toggle());

    expect(await screen.findByText('No text')).toBeInTheDocument();
  });

  it('asks to preview an older version when it is chosen', async () => {
    serveHistory();
    const { onPreview, user } = renderPanel();
    await user.click(toggle());

    await user.click(await screen.findByRole('radio', { name: /version 2/i }));

    expect(onPreview).toHaveBeenLastCalledWith(second);
  });

  it('asks to stop previewing when the current version is chosen again', async () => {
    serveHistory();
    const { onPreview, user } = renderPanel({ previewed: second });
    await user.click(toggle());

    await user.click(await screen.findByRole('radio', { name: /version 3/i }));

    expect(onPreview).toHaveBeenLastCalledWith(null);
  });

  it('shows the previewed version as it looked, with a way to restore it', async () => {
    serveHistory();
    const { user } = renderPanel({ previewed: second });

    await user.click(toggle());

    expect(
      await screen.findByRole('radio', { name: /version 2/i }),
    ).toBeChecked();
    expect(screen.getByRole('radio', { name: /version 3/i })).not.toBeChecked();
    expect(screen.getByTestId('revision-preview')).toHaveTextContent(
      'Second thoughts',
    );
    expect(screen.getByTestId('revision-preview')).toHaveStyle({
      fontSize: '24px',
    });
    expect(
      screen.getByRole('button', { name: /restore this version/i }),
    ).toBeEnabled();
  });

  it('restores the previewed version and goes back to the current one', async () => {
    serveHistory();
    const { onPreview, onRestore, user } = renderPanel({ previewed: second });
    await user.click(toggle());

    await user.click(
      await screen.findByRole('button', { name: /restore this version/i }),
    );

    expect(onRestore).toHaveBeenCalledWith('r1-v2');
    await waitFor(() => expect(onPreview).toHaveBeenLastCalledWith(null));
  });

  it('keeps the preview when the user backs out of restoring', async () => {
    serveHistory();
    const { onPreview, user } = renderPanel({
      previewed: second,
      onRestore: vi.fn(() => Promise.resolve(false)),
    });
    await user.click(toggle());

    await user.click(
      await screen.findByRole('button', { name: /restore this version/i }),
    );

    expect(onPreview).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('says so when a restore fails, and clears that when another version is chosen', async () => {
    serveHistory();
    const { onPreview, user } = renderPanel({
      previewed: second,
      onRestore: vi.fn(() => Promise.reject(new Error('boom'))),
    });
    await user.click(toggle());

    await user.click(
      await screen.findByRole('button', { name: /restore this version/i }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /version 2 could not be restored/i,
    );
    expect(onPreview).not.toHaveBeenCalled();

    await user.click(screen.getByRole('radio', { name: /version 1/i }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('cannot be restored twice while a restore is on its way', async () => {
    serveHistory();
    const { user } = renderPanel({ previewed: second, isRestoring: true });

    await user.click(toggle());

    expect(
      await screen.findByRole('button', { name: /restore this version/i }),
    ).toBeDisabled();
  });

  it('offers another try when the history cannot be loaded', async () => {
    server.use(
      http.get('*/api/v1/riffs/r1/versions', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    const { user } = renderPanel();

    await user.click(toggle());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not be loaded/i,
    );

    serveHistory();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findAllByRole('radio')).toHaveLength(3);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('explains what restoring does and does not bring back', async () => {
    serveHistory();
    const { user } = renderPanel();

    await user.click(toggle());

    expect(
      await screen.findByText(/name and timing stay as they are/i),
    ).toBeInTheDocument();
  });
});
