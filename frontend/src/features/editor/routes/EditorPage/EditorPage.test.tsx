import { act, cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import type { Riff } from '@/features/riffs/types';
import { renderWithQuery } from '@/testUtils/renderWithQuery';
import {
  fakeRiffsApi,
  makeProject,
  makeRiff,
  server,
} from '@/testUtils/server';
import EditorPage from './EditorPage';

/** A stand-in YouTube player the tests can move and inspect. */
const player = vi.hoisted(() => ({
  now: 0,
  getCurrentTime: (): number => 0,
  seekTo: vi.fn(),
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
}));
player.getCurrentTime = () => player.now;

vi.mock('@/features/player/components/YouTubePlayer', async () => {
  const { useEffect } = await import('react');
  return {
    default: function MockPlayer({
      videoId,
      onTime,
      onPlayer,
    }: {
      videoId: string;
      onTime: (seconds: number) => void;
      onPlayer?: (handle: typeof player | null) => void;
    }) {
      useEffect(() => {
        onPlayer?.(player);
        onTime(player.now);
        return () => onPlayer?.(null);
      }, [onPlayer, onTime]);
      return <div data-testid="youtube-player">{videoId}</div>;
    },
  };
});

const project = makeProject({
  id: 'p1',
  title: 'Movie Night',
  videoId: 'abc123XYZ_-',
});
const wait = makeRiff({
  id: 'r1',
  title: 'wait',
  text: 'Wait for it...',
  start: 5,
  end: 9,
});
const classic = makeRiff({
  id: 'r2',
  title: 'Classic',
  text: 'Ha!',
  start: 18,
  end: 25,
});

/** Starts the fake API with these riffs and opens the editor on the project. */
async function openEditor(
  riffs: Riff[] = [wait, classic],
  olderVersions: Parameters<typeof fakeRiffsApi>[2] = {},
) {
  const api = fakeRiffsApi(project, riffs, olderVersions);
  server.use(...api.handlers);
  const view = renderWithQuery(<EditorPage />, {
    route: '/dashboard/projects/p1',
    path: '/dashboard/projects/:projectId',
    history: ['/dashboard'],
  });
  await screen.findByRole('heading', { name: 'Movie Night' });
  return { api, ...view, user: userEvent.setup() };
}

/** A request the test holds back until it calls `release`. */
function gate() {
  let release = () => {};
  const opened = new Promise<void>(resolve => {
    release = resolve;
  });
  return { opened, release };
}

const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** TanStack delivers cache updates on a later tick; let them land. */
const flushQueryUpdates = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

const sidebar = () => screen.getByRole('complementary', { hidden: true });
const sidebarRiffs = () =>
  within(sidebar()).getAllByRole('button', { hidden: true });
/** What is showing over the video right now */
const overVideo = () => within(screen.getByTestId('riff-overlay'));
const nameField = () => screen.getByLabelText(/^name/i);
const textField = () => screen.getByLabelText(/riff text/i);
const startField = () => screen.getByLabelText('Start');
const endField = () => screen.getByLabelText('End');

beforeEach(() => {
  player.now = 0;
  player.seekTo.mockClear();
  player.playVideo.mockClear();
  player.pauseVideo.mockClear();
});

afterEach(async () => {
  vi.restoreAllMocks();
  // Closing the editor sends whatever was still waiting (a timing save, a
  // delete). Let those requests finish against this test's API, not the next.
  cleanup();
  await new Promise(resolve => setTimeout(resolve, 25));
});

describe('<EditorPage /> loading', () => {
  it('loads the project from the API and plays its video', async () => {
    server.use(...fakeRiffsApi(project, [wait]).handlers);
    renderWithQuery(<EditorPage />, {
      route: '/dashboard/projects/p1',
      path: '/dashboard/projects/:projectId',
    });

    expect(screen.getByRole('status')).toHaveTextContent(/loading project/i);
    expect(
      await screen.findByRole('heading', { name: 'Movie Night' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('youtube-player')).toHaveTextContent(
      'abc123XYZ_-',
    );
  });

  it('lists the riffs in time order and opens the first one', async () => {
    await openEditor([classic, wait]);

    expect(sidebarRiffs().map(riff => riff.textContent)).toEqual([
      expect.stringContaining('wait'),
      expect.stringContaining('Classic'),
    ]);
    expect(nameField()).toHaveValue('wait');
    expect(textField()).toHaveValue('Wait for it...');
    expect(startField()).toHaveValue('00:05.0');
    expect(endField()).toHaveValue('00:09.0');
  });

  it('explains how to add the first riff to an empty project', async () => {
    await openEditor([]);

    expect(screen.getByText(/has no riffs yet/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/riff text/i)).toBeNull();
  });

  it('copes with riffs that have no title or styling yet', async () => {
    server.use(
      http.get('*/api/v1/projects/p1', () => HttpResponse.json({ project })),
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({
          riffs: [{ ...wait, title: null, styling: null }],
        }),
      ),
    );
    renderWithQuery(<EditorPage />, {
      route: '/dashboard/projects/p1',
      path: '/dashboard/projects/:projectId',
    });

    expect(await screen.findByLabelText(/^name/i)).toHaveValue('');
    expect(sidebarRiffs()[0]).toHaveTextContent('Wait for it...');
  });

  it('shows "not found" when the API answers 404', async () => {
    server.use(
      http.get('*/api/v1/projects/nope', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
      http.get('*/api/v1/projects/nope/riffs', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );
    renderWithQuery(<EditorPage />, {
      route: '/dashboard/projects/nope',
      path: '/dashboard/projects/:projectId',
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /project not found/i,
    );
    expect(
      screen.getByRole('link', { name: /back to dashboard/i }),
    ).toHaveAttribute('href', '/dashboard');
  });

  it('shows a generic error when loading fails for another reason', async () => {
    server.use(
      http.get('*/api/v1/projects/p1', () => HttpResponse.json({ project })),
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    renderWithQuery(<EditorPage />, {
      route: '/dashboard/projects/p1',
      path: '/dashboard/projects/:projectId',
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /something went wrong/i,
    );
  });
});

describe('<EditorPage /> selecting', () => {
  it('opens the clicked riff and seeks to a second before it starts', async () => {
    const { user } = await openEditor();

    await user.click(sidebarRiffs()[1]);

    expect(nameField()).toHaveValue('Classic');
    expect(player.seekTo).toHaveBeenLastCalledWith(17, true);
  });

  it('never seeks before the start of the video', async () => {
    const { user } = await openEditor([
      makeRiff({ id: 'r0', start: 0.4, end: 3 }),
    ]);

    await user.click(sidebarRiffs()[0]);

    expect(player.seekTo).toHaveBeenLastCalledWith(0, true);
  });

  it('asks before dropping unsaved changes, and stays put on "cancel"', async () => {
    const { user } = await openEditor();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.type(textField(), ' Unsaved');

    await user.click(sidebarRiffs()[1]);

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(nameField()).toHaveValue('wait');
    expect(textField()).toHaveValue('Wait for it... Unsaved');
  });

  it('switches riffs and drops the changes once the user agrees', async () => {
    const { user } = await openEditor();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.type(textField(), ' Unsaved');

    await user.click(sidebarRiffs()[1]);
    expect(nameField()).toHaveValue('Classic');

    await user.click(sidebarRiffs()[0]);
    expect(textField()).toHaveValue('Wait for it...');
  });

  it('asks before leaving for the dashboard with unsaved changes', async () => {
    const { user } = await openEditor();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.type(textField(), '!');

    await user.click(screen.getByRole('link', { name: /dashboard/i }));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Movie Night' })).toBeVisible();
  });
});

describe('<EditorPage /> leaving', () => {
  const closingTabIsHeldUp = () => {
    const closing = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(closing);
    return closing.defaultPrevented;
  };

  it('holds up closing the tab while there is unsaved text', async () => {
    const { user } = await openEditor();
    expect(closingTabIsHeldUp()).toBe(false);

    await user.type(textField(), '!');
    expect(closingTabIsHeldUp()).toBe(true);

    await user.keyboard('{Escape}');
    expect(closingTabIsHeldUp()).toBe(false);
  });

  it('holds up closing the tab until a timing change has been saved', async () => {
    const { user } = await openEditor();

    await user.click(
      screen.getByRole('button', { name: 'Move start 0.1 seconds later' }),
    );
    expect(closingTabIsHeldUp()).toBe(true);

    await waitFor(
      () =>
        expect(screen.getByRole('status')).toHaveTextContent(/timing saved/i),
      { timeout: 3000 },
    );
    expect(closingTabIsHeldUp()).toBe(false);
  });

  it('asks before the Back button drops unsaved changes, and stays on "cancel"', async () => {
    const { router, user } = await openEditor();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.type(textField(), ' Unsaved');

    await act(() => router.navigate(-1));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(textField()).toHaveValue('Wait for it... Unsaved');
    expect(screen.queryByText('Another page')).toBeNull();
  });

  it('goes Back once the user agrees to drop the changes', async () => {
    const { router, user } = await openEditor();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.type(textField(), ' Unsaved');

    await act(() => router.navigate(-1));

    expect(await screen.findByText('Another page')).toBeInTheDocument();
  });

  it('leaves without asking when nothing is unsaved', async () => {
    const { user } = await openEditor();
    const confirm = vi.spyOn(window, 'confirm');

    await user.click(screen.getByRole('link', { name: /dashboard/i }));

    expect(await screen.findByText('Another page')).toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
  });
});

describe('<EditorPage /> adding riffs', () => {
  it('adds a 3 second riff at the playhead, pauses, and focuses the text box', async () => {
    const { api, user } = await openEditor();
    player.now = 12.34;

    await user.click(screen.getByRole('button', { name: '+ Riff' }));

    await waitFor(() => expect(textField()).toHaveFocus());
    expect(player.pauseVideo).toHaveBeenCalled();
    expect(api.sent('POST')[0].body).toMatchObject({ start: 12.3, end: 15.3 });
    expect(startField()).toHaveValue('00:12.3');
    expect(endField()).toHaveValue('00:15.3');
    expect(textField()).toHaveValue('');
    // In time order between the two riffs that were already there
    expect(sidebarRiffs()).toHaveLength(3);
    expect(sidebarRiffs()[1]).toHaveAttribute('aria-current', 'true');
  });

  it('adds a riff with the T key', async () => {
    const { api, user } = await openEditor([]);
    player.now = 2;

    await user.keyboard('t');

    await waitFor(() => expect(textField()).toHaveFocus());
    expect(api.sent('POST')[0].body).toMatchObject({ start: 2, end: 5 });
  });

  it('types a T into a text field instead of adding a riff', async () => {
    const { api, user } = await openEditor();

    await user.type(textField(), 'tot');

    expect(textField()).toHaveValue('Wait for it...tot');
    expect(api.sent('POST')).toHaveLength(0);
  });

  it('lets the new riff be written and saved straight away', async () => {
    const { api, user } = await openEditor([]);

    await user.keyboard('t');
    await waitFor(() => expect(textField()).toHaveFocus());
    await user.keyboard('Here we go{Meta>}s{/Meta}');

    await waitFor(() =>
      expect(api.sent('PATCH')[0]).toMatchObject({
        id: 'new-1',
        body: { text: 'Here we go' },
      }),
    );
    expect(api.riffs()[0]).toMatchObject({ text: 'Here we go', version: 2 });
  });

  it('keeps what is typed while the new riff is still being created', async () => {
    const { user } = await openEditor();
    const slow = gate();
    server.use(
      http.post('*/api/v1/projects/p1/riffs', async () => {
        await slow.opened;
        return HttpResponse.json(
          {
            riff: makeRiff({
              id: 'new-1',
              start: 12,
              end: 15,
              title: '',
              text: '',
            }),
          },
          { status: 201 },
        );
      }),
    );
    const confirm = vi.spyOn(window, 'confirm');
    player.now = 12;

    await user.click(screen.getByRole('button', { name: '+ Riff' }));
    await user.type(textField(), ' Typed meanwhile');
    slow.release();

    // The new riff shows up in the list, but does not take over the editor
    await waitFor(() => expect(sidebarRiffs()).toHaveLength(3));
    await flushQueryUpdates();
    expect(nameField()).toHaveValue('wait');
    expect(textField()).toHaveValue('Wait for it... Typed meanwhile');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('opens the new riff after the user agreed to drop unsaved changes', async () => {
    const { user } = await openEditor();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.type(textField(), ' Unsaved');
    player.now = 12;

    await user.click(screen.getByRole('button', { name: '+ Riff' }));

    await waitFor(() => expect(textField()).toHaveFocus());
    expect(textField()).toHaveValue('');
    expect(startField()).toHaveValue('00:12.0');
  });

  it('adds nothing when the user keeps their unsaved changes', async () => {
    const { api, user } = await openEditor();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.type(textField(), ' Unsaved');

    await user.click(screen.getByRole('button', { name: '+ Riff' }));

    expect(api.sent('POST')).toHaveLength(0);
    expect(textField()).toHaveValue('Wait for it... Unsaved');
  });

  it('says so when the riff could not be added', async () => {
    const { user } = await openEditor();
    server.use(
      http.post('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );

    await user.click(screen.getByRole('button', { name: '+ Riff' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not add the riff/i,
    );
    expect(sidebarRiffs()).toHaveLength(2);
  });
});

describe('<EditorPage /> editing text and style', () => {
  it('saves only what changed, and only when asked', async () => {
    const { api, user } = await openEditor();
    const save = () => screen.getByRole('button', { name: /save/i });
    expect(save()).toBeDisabled();

    await user.clear(nameField());
    await user.type(nameField(), 'Renamed');
    await user.type(textField(), ' Really.');

    expect(api.sent('PATCH')).toHaveLength(0);
    await user.click(save());

    await waitFor(() => expect(save()).toBeDisabled());
    expect(api.sent('PATCH')).toEqual([
      {
        method: 'PATCH',
        id: 'r1',
        body: { title: 'Renamed', text: 'Wait for it... Really.' },
      },
    ]);
    expect(sidebarRiffs()[0]).toHaveTextContent('Renamed');
  });

  it('saves with Cmd+S from inside a text field', async () => {
    const { api, user } = await openEditor();

    await user.type(textField(), '!{Meta>}s{/Meta}');

    await waitFor(() =>
      expect(api.sent('PATCH')[0]?.body).toEqual({ text: 'Wait for it...!' }),
    );
  });

  it('saves with Ctrl+S too', async () => {
    const { api, user } = await openEditor();

    await user.type(textField(), '!{Control>}s{/Control}');

    await waitFor(() => expect(api.sent('PATCH')).toHaveLength(1));
  });

  it('reverts unsaved changes with Esc', async () => {
    const { api, user } = await openEditor();

    await user.type(textField(), ' Never mind{Escape}');

    expect(textField()).toHaveValue('Wait for it...');
    expect(api.sent('PATCH')).toHaveLength(0);
  });

  it('reverts with the Undo changes button', async () => {
    const { user } = await openEditor();
    await user.type(nameField(), '!!');

    await user.click(screen.getByRole('button', { name: /undo changes/i }));

    expect(nameField()).toHaveValue('wait');
  });

  it('saves the styling and previews it over the video while editing', async () => {
    player.now = 6;
    const { api, user } = await openEditor();

    await user.selectOptions(screen.getByLabelText(/font size/i), '24');

    // Unsaved, yet already shown in the overlay
    const overlay = screen.getByText('Wait for it...', { selector: 'span' });
    expect(overlay).toHaveStyle({ fontSize: '24px' });

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(api.sent('PATCH')[0]?.body).toEqual({ styling: { fontSize: 24 } }),
    );
  });

  it('previews unsaved text over the video', async () => {
    player.now = 6;
    const { user } = await openEditor();

    await user.type(textField(), ' Now!');

    expect(
      screen.getByText('Wait for it... Now!', { selector: 'span' }),
    ).toBeInTheDocument();
  });

  it('keeps the changes and explains when a save is rejected', async () => {
    const { user } = await openEditor();
    server.use(
      http.patch('*/api/v1/projects/p1/riffs/r1', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    await user.type(textField(), '!');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not save the riff/i,
    );
    expect(textField()).toHaveValue('Wait for it...!');
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });

  it('keeps unsaved text when the riffs are refreshed underneath it', async () => {
    const { queryClient, user } = await openEditor();
    await user.type(textField(), ' Mine');

    server.use(
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({
          riffs: [{ ...wait, text: 'Changed elsewhere' }, classic],
        }),
      ),
    );
    await act(() => queryClient.refetchQueries());
    await flushQueryUpdates();

    expect(textField()).toHaveValue('Wait for it... Mine');
  });

  it('keeps the editor and its edits when a background refresh fails', async () => {
    const { queryClient, user } = await openEditor();
    await user.type(textField(), ' Mine');

    server.use(
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    await act(() => queryClient.refetchQueries());
    await flushQueryUpdates();

    expect(screen.getByRole('heading', { name: 'Movie Night' })).toBeVisible();
    expect(textField()).toHaveValue('Wait for it... Mine');
  });
});

describe('<EditorPage /> timing', () => {
  const savedTiming = async (api: ReturnType<typeof fakeRiffsApi>) => {
    await waitFor(() => expect(api.sent('PATCH')).not.toHaveLength(0), {
      timeout: 3000,
    });
    return api.sent('PATCH');
  };

  it('nudges the start and saves it by itself a moment later', async () => {
    const { api, user } = await openEditor();

    await user.click(
      screen.getByRole('button', { name: 'Move start 0.1 seconds later' }),
    );

    expect(startField()).toHaveValue('00:05.1');
    expect(api.sent('PATCH')).toHaveLength(0);
    expect(await savedTiming(api)).toEqual([
      { method: 'PATCH', id: 'r1', body: { start: 5.1, end: 9 } },
    ]);
    await waitFor(() =>
      expect(screen.getByText(/timing saved/i)).toBeInTheDocument(),
    );
  });

  it('sends a burst of nudges as one save', async () => {
    const { api, user } = await openEditor();
    const later = screen.getByRole('button', {
      name: 'Move end 0.1 seconds later',
    });

    await user.click(later);
    await user.click(later);
    await user.click(later);

    expect(endField()).toHaveValue('00:09.3');
    expect(await savedTiming(api)).toEqual([
      { method: 'PATCH', id: 'r1', body: { start: 5, end: 9.3 } },
    ]);
  });

  it('will not nudge the start past the end, or the end before the start', async () => {
    const { user } = await openEditor([
      makeRiff({ id: 'r1', start: 5, end: 5.5 }),
    ]);

    await user.click(
      screen.getByRole('button', { name: 'Move start 1 second later' }),
    );
    expect(startField()).toHaveValue('00:05.4');

    await user.click(
      screen.getByRole('button', { name: 'Move end 1 second earlier' }),
    );
    expect(endField()).toHaveValue('00:05.5');
  });

  it('saves a typed time', async () => {
    const { api, user } = await openEditor();

    await user.clear(endField());
    await user.type(endField(), '0:12.5{Enter}');

    expect(screen.getByText('7.5s')).toBeInTheDocument();
    expect(await savedTiming(api)).toEqual([
      { method: 'PATCH', id: 'r1', body: { start: 5, end: 12.5 } },
    ]);
  });

  it('refuses an end before the start and puts the time back', async () => {
    const { api, user } = await openEditor();

    await user.clear(endField());
    await user.type(endField(), '0:02{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /has to end after it starts/i,
    );
    expect(endField()).toHaveValue('00:09.0');
    expect(api.sent('PATCH')).toHaveLength(0);
  });

  it('sets the in and out points from the playhead with I and O', async () => {
    const { api, user } = await openEditor();

    player.now = 6.27;
    await user.keyboard('i');
    expect(startField()).toHaveValue('00:06.3');

    player.now = 8;
    await user.keyboard('o');
    expect(endField()).toHaveValue('00:08.0');

    expect(await savedTiming(api)).toEqual([
      { method: 'PATCH', id: 'r1', body: { start: 6.3, end: 8 } },
    ]);
  });

  it('moves the whole riff when the in point lands after its end', async () => {
    const { user } = await openEditor();
    player.now = 30;

    await user.keyboard('i');

    expect(startField()).toHaveValue('00:30.0');
    expect(endField()).toHaveValue('00:34.0');
  });

  it('refuses an out point before the in point', async () => {
    const { user } = await openEditor();
    player.now = 3;

    await user.keyboard('o');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /out point has to come after/i,
    );
    expect(endField()).toHaveValue('00:09.0');
  });

  it('slides the riff with the arrow keys, a second at a time with Shift', async () => {
    const { user } = await openEditor();

    await user.keyboard('{ArrowRight}');
    expect(startField()).toHaveValue('00:05.1');
    expect(endField()).toHaveValue('00:09.1');

    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(startField()).toHaveValue('00:04.1');
    expect(endField()).toHaveValue('00:08.1');
  });

  it('stops sliding at the start of the video without squashing the riff', async () => {
    const { user } = await openEditor([
      makeRiff({ id: 'r1', start: 0.3, end: 3.3 }),
    ]);

    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');

    expect(startField()).toHaveValue('00:00.0');
    expect(endField()).toHaveValue('00:03.0');
  });

  it('keeps unsaved text while the timing changes', async () => {
    const { api, user } = await openEditor();
    await user.type(textField(), ' Mine');

    await user.click(
      screen.getByRole('button', { name: 'Move start 1 second later' }),
    );

    expect(await savedTiming(api)).toEqual([
      { method: 'PATCH', id: 'r1', body: { start: 6, end: 9 } },
    ]);
    expect(textField()).toHaveValue('Wait for it... Mine');
  });

  it('reorders the list when a riff moves past another', async () => {
    const { user } = await openEditor();

    // The end has to move first: a start past the end would be refused.
    await user.clear(endField());
    await user.type(endField(), '0:44{Enter}');
    await user.clear(startField());
    await user.type(startField(), '0:40{Enter}');

    expect(sidebarRiffs().map(riff => riff.textContent)).toEqual([
      expect.stringContaining('Classic'),
      expect.stringContaining('wait'),
    ]);
  });

  it('warns about riffs that overlap, and stops when they no longer do', async () => {
    const { user } = await openEditor([
      wait,
      makeRiff({ id: 'r2', title: 'Classic', text: 'Ha!', start: 8, end: 12 }),
    ]);

    expect(screen.getByText(/overlaps another riff/i)).toBeInTheDocument();
    expect(sidebarRiffs()[0]).toHaveTextContent(/overlaps/i);
    expect(sidebarRiffs()[1]).toHaveTextContent(/overlaps/i);

    await user.click(
      screen.getByRole('button', { name: 'Move end 1 second earlier' }),
    );

    expect(screen.queryByText(/overlaps another riff/i)).toBeNull();
    expect(sidebarRiffs()[0]).not.toHaveTextContent(/overlaps/i);
  });

  it('never has two saves for one riff on their way at once', async () => {
    const { user } = await openEditor();
    const slow = gate();
    const bodies: unknown[] = [];
    let active = 0;
    let mostActive = 0;
    server.use(
      http.patch('*/api/v1/projects/p1/riffs/r1', async ({ request }) => {
        const { riff: body } = (await request.json()) as { riff: Riff };
        bodies.push(body);
        active += 1;
        mostActive = Math.max(mostActive, active);
        if (bodies.length === 1) await slow.opened;
        active -= 1;
        return HttpResponse.json({ riff: { ...wait, ...body } });
      }),
    );
    const later = screen.getByRole('button', {
      name: 'Move start 0.1 seconds later',
    });

    await user.click(later);
    await waitFor(() => expect(bodies).toHaveLength(1), { timeout: 3000 });
    // A second edit while the first save is still on its way...
    await user.click(later);
    await act(() => pause(700));
    // ...waits for it instead of racing it
    expect(bodies).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(/saving timing/i);

    slow.release();

    await waitFor(() =>
      expect(bodies).toEqual([
        { start: 5.1, end: 9 },
        { start: 5.2, end: 9 },
      ]),
    );
    expect(mostActive).toBe(1);
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/timing saved/i),
    );
    expect(startField()).toHaveValue('00:05.2');
  });

  it('keeps another riff\u2019s waiting edit when a timing save fails', async () => {
    const { api, user } = await openEditor();
    const slow = gate();
    server.use(
      http.patch('*/api/v1/projects/p1/riffs/r1', async () => {
        await slow.opened;
        return HttpResponse.json({ error: 'boom' }, { status: 500 });
      }),
    );

    await user.click(
      screen.getByRole('button', { name: 'Move start 1 second later' }),
    );
    await act(() => pause(600)); // r1's save is now on its way, and will fail

    await user.click(sidebarRiffs()[1]);
    await user.click(
      screen.getByRole('button', { name: 'Move start 1 second later' }),
    );
    slow.release();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    // r1 is back to what the server has; r2 keeps its edit and still saves it
    await waitFor(() => expect(sidebarRiffs()[0]).toHaveTextContent('00:05.0'));
    expect(startField()).toHaveValue('00:19.0');
    await waitFor(
      () =>
        expect(api.sent('PATCH')).toEqual([
          { method: 'PATCH', id: 'r2', body: { start: 19, end: 25 } },
        ]),
      { timeout: 3000 },
    );
    expect(startField()).toHaveValue('00:19.0');
  });

  it('forgets half-typed input when another riff with the same time is opened', async () => {
    const twin = makeRiff({ id: 'r2', title: 'Twin', start: 5, end: 12 });
    const { user } = await openEditor([wait, twin]);
    expect(nameField()).toHaveValue('wait');

    await user.clear(startField());
    await user.type(startField(), 'soon{Enter}');
    expect(startField()).toHaveAttribute('aria-invalid', 'true');

    await user.click(sidebarRiffs()[1]);
    expect(nameField()).toHaveValue('Twin');

    expect(startField()).toHaveValue('00:05.0');
    expect(startField()).toHaveAttribute('aria-invalid', 'false');
  });

  it('sends a waiting timing save when the editor closes', async () => {
    const { api, user, unmount } = await openEditor();
    await user.click(
      screen.getByRole('button', { name: 'Move start 0.1 seconds later' }),
    );

    unmount();

    await waitFor(() =>
      expect(api.sent('PATCH')).toEqual([
        { method: 'PATCH', id: 'r1', body: { start: 5.1, end: 9 } },
      ]),
    );
  });

  it('shows the server’s timing again when the save is rejected', async () => {
    const { user } = await openEditor();
    server.use(
      http.patch('*/api/v1/projects/p1/riffs/r1', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );

    await user.click(
      screen.getByRole('button', { name: 'Move start 1 second later' }),
    );
    expect(startField()).toHaveValue('00:06.0');

    expect(
      await screen.findByRole('alert', {}, { timeout: 3000 }),
    ).toHaveTextContent(/could not save the riff/i);
    await waitFor(() => expect(startField()).toHaveValue('00:05.0'));
  });
});

describe('<EditorPage /> deleting', () => {
  it('removes the riff at once, opens its neighbour, and offers an undo', async () => {
    const { api, user } = await openEditor();

    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(sidebarRiffs()).toHaveLength(1);
    expect(nameField()).toHaveValue('Classic');
    expect(screen.getByText(/riff deleted/i)).toBeInTheDocument();
    // Nothing is sent while it can still be undone
    expect(api.sent('DELETE')).toHaveLength(0);
  });

  it('brings the riff back on Undo without ever telling the server', async () => {
    const { api, user } = await openEditor();
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await user.click(screen.getByRole('button', { name: /^undo$/i }));

    expect(sidebarRiffs()).toHaveLength(2);
    expect(nameField()).toHaveValue('wait');
    expect(screen.queryByText(/riff deleted/i)).toBeNull();
    expect(api.sent('DELETE')).toHaveLength(0);
  });

  it('deletes on the server once the undo window closes', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
      shouldAdvanceTime: true,
    });
    try {
      const { api, user } = await openEditor();
      await user.click(screen.getByRole('button', { name: /^delete$/i }));

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() =>
        expect(api.sent('DELETE')).toEqual([{ method: 'DELETE', id: 'r1' }]),
      );
      await waitFor(() =>
        expect(screen.queryByText(/riff deleted/i)).toBeNull(),
      );
      expect(sidebarRiffs()).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('sends the first delete when a second riff is deleted', async () => {
    const { api, user } = await openEditor();

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() =>
      expect(api.sent('DELETE')).toEqual([{ method: 'DELETE', id: 'r1' }]),
    );
    expect(screen.getByText(/has no riffs yet/i)).toBeInTheDocument();
    // The second one can still be undone
    await user.click(screen.getByRole('button', { name: /^undo$/i }));
    expect(nameField()).toHaveValue('Classic');
  });

  it('sends a waiting delete when the editor closes', async () => {
    const { api, user, unmount } = await openEditor();
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    unmount();

    await waitFor(() =>
      expect(api.sent('DELETE')).toEqual([{ method: 'DELETE', id: 'r1' }]),
    );
  });

  it('asks before deleting a riff that has unsaved changes', async () => {
    const { user } = await openEditor();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.type(textField(), ' Unsaved');

    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(sidebarRiffs()).toHaveLength(2);
    expect(textField()).toHaveValue('Wait for it... Unsaved');
    expect(screen.queryByText(/riff deleted/i)).toBeNull();

    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(sidebarRiffs()).toHaveLength(1);
    expect(screen.getByText(/riff deleted/i)).toBeInTheDocument();
  });

  it('still saves a timing edit made just before a delete that is undone', async () => {
    const { api, user } = await openEditor();

    await user.click(
      screen.getByRole('button', { name: 'Move start 1 second later' }),
    );
    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await user.click(screen.getByRole('button', { name: /^undo$/i }));

    expect(startField()).toHaveValue('00:06.0');
    await waitFor(
      () =>
        expect(api.sent('PATCH')).toEqual([
          { method: 'PATCH', id: 'r1', body: { start: 6, end: 9 } },
        ]),
      { timeout: 3000 },
    );
    expect(api.riffs()[0]).toMatchObject({ start: 6, end: 9 });
  });

  it('opens the riff again when deleting the only one fails', async () => {
    const { user } = await openEditor([wait]);
    server.use(
      http.delete('*/api/v1/projects/p1/riffs/:id', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
      shouldAdvanceTime: true,
    });
    try {
      await user.click(screen.getByRole('button', { name: /^delete$/i }));
      expect(screen.queryByLabelText(/riff text/i)).toBeNull();

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /could not delete the riff/i,
      );
      await waitFor(() => expect(nameField()).toHaveValue('wait'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('puts the riff back and explains when the delete fails', async () => {
    const { user } = await openEditor();
    server.use(
      http.delete('*/api/v1/projects/p1/riffs/:id', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not delete the riff/i,
    );
    await waitFor(() =>
      expect(within(sidebar()).getByText('wait')).toBeInTheDocument(),
    );
  });
});

describe('<EditorPage /> revision history', () => {
  /** "wait" as its third version, after two earlier wordings. */
  const openWithHistory = () =>
    openEditor([wait, classic], {
      r1: [
        { text: 'First draft', styling: {} },
        { text: 'Second thoughts', styling: { fontSize: 24 } },
      ],
    });

  const openHistory = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /revision history/i }));
    return screen.findAllByRole('radio');
  };

  it('lists the versions of the selected riff once the panel is opened', async () => {
    const { user } = await openWithHistory();

    const options = await openHistory(user);

    expect(options).toHaveLength(3);
    expect(
      screen.getByRole('radio', { name: /version 3 \(current\)/i }),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: /version 1/i }),
    ).toHaveAccessibleName(/first draft/i);
  });

  it('previews an older version over the video without changing the riff', async () => {
    player.now = 6;
    const { api, user } = await openWithHistory();
    await openHistory(user);

    await user.click(screen.getByRole('radio', { name: /version 2/i }));

    expect(overVideo().getByText('Second thoughts')).toHaveStyle({
      fontSize: '24px',
    });
    expect(screen.getByTestId('revision-preview')).toHaveTextContent(
      'Second thoughts',
    );
    // The riff itself is untouched
    expect(textField()).toHaveValue('Wait for it...');
    expect(api.restores).toHaveLength(0);

    await user.click(screen.getByRole('radio', { name: /version 3/i }));

    expect(overVideo().getByText('Wait for it...')).toBeInTheDocument();
    expect(screen.queryByTestId('revision-preview')).toBeNull();
  });

  it('restores an older version as a new one', async () => {
    const { api, user } = await openWithHistory();
    await openHistory(user);
    await user.click(screen.getByRole('radio', { name: /version 2/i }));

    await user.click(
      screen.getByRole('button', { name: /restore this version/i }),
    );

    await waitFor(() => expect(textField()).toHaveValue('Second thoughts'));
    expect(api.restores).toEqual([{ riffId: 'r1', versionId: 'r1-v2' }]);
    expect(screen.getByLabelText(/font size/i)).toHaveValue('24');
    // History grew instead of being rewritten, and the new version is current
    expect(
      await screen.findByRole('radio', { name: /version 4 \(current\)/i }),
    ).toBeChecked();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.queryByTestId('revision-preview')).toBeNull();
    expect(api.versions('r1').map(version => version.text)).toEqual([
      'First draft',
      'Second thoughts',
      'Wait for it...',
      'Second thoughts',
    ]);
  });

  it('leaves the name and timing alone when restoring', async () => {
    const { user } = await openWithHistory();
    await openHistory(user);
    await user.click(screen.getByRole('radio', { name: /version 1/i }));

    await user.click(
      screen.getByRole('button', { name: /restore this version/i }),
    );

    await waitFor(() => expect(textField()).toHaveValue('First draft'));
    expect(nameField()).toHaveValue('wait');
    expect(startField()).toHaveValue('00:05.0');
    expect(endField()).toHaveValue('00:09.0');
  });

  it('asks before a restore drops unsaved changes, and does nothing on "cancel"', async () => {
    const { api, user } = await openWithHistory();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.type(textField(), ' Unsaved');
    await openHistory(user);
    await user.click(screen.getByRole('radio', { name: /version 2/i }));

    await user.click(
      screen.getByRole('button', { name: /restore this version/i }),
    );

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(api.restores).toHaveLength(0);
    expect(textField()).toHaveValue('Wait for it... Unsaved');
    // Still looking at the old version, free to try again
    expect(screen.getByTestId('revision-preview')).toBeInTheDocument();
  });

  it('restores over unsaved changes once the user agrees', async () => {
    const { user } = await openWithHistory();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.type(textField(), ' Unsaved');
    await openHistory(user);
    await user.click(screen.getByRole('radio', { name: /version 2/i }));

    await user.click(
      screen.getByRole('button', { name: /restore this version/i }),
    );

    await waitFor(() => expect(textField()).toHaveValue('Second thoughts'));
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('says so in the panel when a restore fails, and changes nothing', async () => {
    const { user } = await openWithHistory();
    server.use(
      http.post('*/api/v1/riffs/r1/versions/:versionId/restore', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    await openHistory(user);
    await user.click(screen.getByRole('radio', { name: /version 2/i }));

    await user.click(
      screen.getByRole('button', { name: /restore this version/i }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /version 2 could not be restored/i,
    );
    expect(textField()).toHaveValue('Wait for it...');
    expect(
      screen.getByRole('button', { name: /restore this version/i }),
    ).toBeEnabled();
  });

  it('adds a version to the open history when the text is saved', async () => {
    const { user } = await openWithHistory();
    await openHistory(user);

    await user.type(textField(), ' Again.{Meta>}s{/Meta}');

    expect(
      await screen.findByRole('radio', { name: /version 4 \(current\)/i }),
    ).toHaveAccessibleName(/wait for it\.\.\. again\./i);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('shows each riff its own history, starting closed', async () => {
    const { user } = await openWithHistory();
    await openHistory(user);
    expect(screen.getAllByRole('radio')).toHaveLength(3);

    await user.click(sidebarRiffs()[1]);

    expect(
      screen.getByRole('button', { name: /revision history/i }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(await openHistory(user)).toHaveLength(1);
  });

  it('forgets a preview when another riff is opened', async () => {
    // Starts so early that selecting it seeks to 0:00, inside the riff, so the
    // overlay shows whichever wording is in effect.
    const early = makeRiff({
      id: 'r1',
      title: 'wait',
      text: 'Wait for it...',
      start: 0.2,
      end: 4,
    });
    const { user } = await openEditor([early, classic], {
      r1: [{ text: 'Second thoughts', styling: {} }],
    });
    await openHistory(user);
    await user.click(screen.getByRole('radio', { name: /version 1/i }));
    expect(overVideo().getByText('Second thoughts')).toBeInTheDocument();

    await user.click(sidebarRiffs()[1]);
    await user.click(sidebarRiffs()[0]);

    // The riff's own words are back over the video...
    expect(overVideo().getByText('Wait for it...')).toBeInTheDocument();
    expect(overVideo().queryByText('Second thoughts')).toBeNull();
    // ...and its history opens on the current version, with no preview
    await openHistory(user);
    expect(
      screen.getByRole('radio', { name: /version 2 \(current\)/i }),
    ).toBeChecked();
    expect(screen.getByRole('radio', { name: /version 1/i })).not.toBeChecked();
    expect(screen.queryByTestId('revision-preview')).toBeNull();
  });

  it('locks editing while a restore is on its way, so nothing typed is lost', async () => {
    const { api, user } = await openWithHistory();
    const slow = gate();
    server.use(
      http.post('*/api/v1/riffs/r1/versions/:versionId/restore', async () => {
        await slow.opened;
        return HttpResponse.json(
          {
            riff: {
              ...wait,
              text: 'Second thoughts',
              styling: { fontSize: 24 },
              version: 4,
            },
          },
          { status: 201 },
        );
      }),
    );
    await openHistory(user);
    await user.click(screen.getByRole('radio', { name: /version 2/i }));

    await user.click(
      screen.getByRole('button', { name: /restore this version/i }),
    );

    // While it runs, nothing that the restore would overwrite can be edited
    await waitFor(() => expect(textField()).toBeDisabled());
    expect(nameField()).toBeDisabled();
    expect(screen.getByLabelText(/font size/i)).toBeDisabled();
    expect(screen.getByLabelText(/background/i)).toBeDisabled();
    await user.type(textField(), ' typed meanwhile');
    expect(textField()).toHaveValue('Wait for it...');
    // ...and Cmd+S has nothing to send
    await user.keyboard('{Meta>}s{/Meta}');
    expect(api.sent('PATCH')).toHaveLength(0);

    slow.release();

    await waitFor(() => expect(textField()).toHaveValue('Second thoughts'));
    expect(textField()).toBeEnabled();
    expect(nameField()).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /no changes to save/i }),
    ).toBeDisabled();
  });

  it('unlocks editing again when a restore fails', async () => {
    const { user } = await openWithHistory();
    server.use(
      http.post('*/api/v1/riffs/r1/versions/:versionId/restore', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    await openHistory(user);
    await user.click(screen.getByRole('radio', { name: /version 2/i }));

    await user.click(
      screen.getByRole('button', { name: /restore this version/i }),
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(textField()).toBeEnabled();
    await user.type(textField(), '!');
    expect(textField()).toHaveValue('Wait for it...!');
  });
});
