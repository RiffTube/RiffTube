import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { Riff } from '@/features/riffs/types';
import { makeRiff } from '@/testUtils/server';
import EditorWorkspace from './EditorWorkspace';

vi.mock('@/features/player/components/YouTubePlayer', () => ({
  default: ({ videoId }: { videoId: string }) => (
    <div data-testid="youtube-player">{videoId}</div>
  ),
}));

const riffs: Riff[] = [
  makeRiff(),
  makeRiff({ id: 'r2', title: 'Classic', start: 18, end: 25, text: 'Ha!' }),
];

function renderWorkspace(
  props: Partial<React.ComponentProps<typeof EditorWorkspace>> = {},
) {
  const setRiffs = vi.fn();
  render(
    <MemoryRouter>
      <EditorWorkspace
        projectTitle="My Project"
        videoId="dQw4w9WgXcQ"
        selectedId={riffs[0].id}
        riffs={riffs}
        setRiffs={setRiffs}
        {...props}
      />
    </MemoryRouter>,
  );
  return { setRiffs };
}

describe('<EditorWorkspace />', () => {
  it('shows the project title and its video', () => {
    renderWorkspace();

    expect(
      screen.getByRole('heading', { name: 'My Project' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('youtube-player')).toHaveTextContent(
      'dQw4w9WgXcQ',
    );
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('renders the selected riff, with duration derived from start and end', () => {
    renderWorkspace();

    expect(screen.getByLabelText(/Name/i)).toHaveValue('wait');

    const durationInput = screen.getByLabelText(/Duration/i);
    expect(durationInput).toHaveValue('4');
    expect(durationInput).toHaveAttribute('readOnly');
  });

  it('lets the user edit the riff title and reflects it immediately', async () => {
    renderWorkspace();
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'New Title');

    expect(nameInput).toHaveValue('New Title');
  });

  it('only enables Save once something changed', async () => {
    renderWorkspace();
    const user = userEvent.setup();

    const save = () => screen.getByRole('button', { name: /save/i });
    expect(save()).toBeDisabled();

    await user.type(screen.getByLabelText(/Name/i), '!');
    expect(save()).toBeEnabled();
  });

  it('undoes changes when "Undo changes" is clicked', async () => {
    renderWorkspace();
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Temporary');
    expect(nameInput).toHaveValue('Temporary');

    await user.click(screen.getByRole('button', { name: /undo changes/i }));

    expect(nameInput).toHaveValue('wait');
  });

  it('saves changes and calls setRiffs with the updated riff on "Save"', async () => {
    const riffIndex = 1;
    const riffToEdit = riffs[riffIndex];
    const { setRiffs } = renderWorkspace({ selectedId: riffToEdit.id });
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Saved Title');
    await user.click(screen.getByRole('button', { name: /save/i }));

    const newState = setRiffs.mock.calls[0][0] as Riff[];
    expect(newState[riffIndex]).toEqual({
      ...riffToEdit,
      title: 'Saved Title',
    });
    expect(newState[0]).toEqual(riffs[0]);
  });

  it('moves the end time when the duration is edited', async () => {
    const { setRiffs } = renderWorkspace();
    const user = userEvent.setup();

    // The annotation form's number input (the read-only one is a textbox)
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '6' },
    });

    const save = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    const newState = setRiffs.mock.calls[0][0] as Riff[];
    expect(newState[0]).toMatchObject({ start: 5, end: 11 });
  });

  it('says so when the project has no riffs', () => {
    renderWorkspace({ riffs: [], selectedId: null });

    expect(screen.getByText(/no riffs yet/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Name/i)).toBeNull();
  });

  it('offers only the current revision until history is wired up', async () => {
    renderWorkspace();
    const user = userEvent.setup();

    await user.click(screen.getByText(/advanced options/i));

    expect(screen.getAllByRole('radio')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: /current/i })).toBeChecked();
  });
});
