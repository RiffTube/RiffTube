import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DummyRiff, dummyRiffs } from '../../data/dummyRiffs';
import EditorWorkspace from './EditorWorkspace';

describe('<EditorWorkspace />', () => {
  it('renders the selected riff in the name and duration inputs', () => {
    const setRiffsMock = vi.fn();
    render(
      <EditorWorkspace
        selectedId={dummyRiffs[0].id}
        riffs={dummyRiffs}
        setRiffs={setRiffsMock}
      />,
    );

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput).toHaveValue(dummyRiffs[0].title);

    const durationInput = screen.getByLabelText(
      /Duration/i,
    ) as HTMLInputElement;
    expect(durationInput).toHaveValue(String(dummyRiffs[0].duration));
    expect(durationInput).toHaveAttribute('readOnly');
  });

  it('lets the user edit the riff title and reflects it immediately', async () => {
    const setRiffsMock = vi.fn();
    render(
      <EditorWorkspace
        selectedId={dummyRiffs[0].id}
        riffs={dummyRiffs}
        setRiffs={setRiffsMock}
      />,
    );
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'New Title');

    expect(nameInput).toHaveValue('New Title');
  });

  it('undoes changes when "Undo changes" is clicked', async () => {
    const setRiffsMock = vi.fn();
    render(
      <EditorWorkspace
        selectedId={dummyRiffs[0].id}
        riffs={dummyRiffs}
        setRiffs={setRiffsMock}
      />,
    );
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Temporary');
    expect(nameInput).toHaveValue('Temporary');

    const undoButton = screen.getByRole('button', { name: /undo changes/i });
    await user.click(undoButton);

    expect(nameInput).toHaveValue(dummyRiffs[0].title);
  });

  it('saves changes and calls setRiffs with the updated riff on "Save"', async () => {
    const setRiffsMock = vi.fn();
    const user = userEvent.setup();

    // 🔢 choose your riff index once
    const riffIndex = 1;
    const riffToEdit = dummyRiffs[riffIndex];

    render(
      <EditorWorkspace
        selectedId={riffToEdit.id}
        riffs={dummyRiffs}
        setRiffs={setRiffsMock}
      />,
    );

    // 1) change the title input
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Saved Title');

    // 2) click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // 3) grab the first argument of the first call to setRiffs
    const newStateArray = setRiffsMock.mock.calls[0][0] as DummyRiff[];

    // 4) assert that at riffIndex the title was updated
    expect(newStateArray[riffIndex]).toMatchObject({
      ...riffToEdit,
      title: 'Saved Title',
    });

    // and everything else is unchanged
    dummyRiffs.forEach((r, i) => {
      if (i !== riffIndex) {
        expect(newStateArray[i]).toEqual(r);
      }
    });
  });
  it('loads a revision when a revision is selected', async () => {
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        selectedId={dummyRiffs[0].id}
        riffs={dummyRiffs}
        setRiffs={vi.fn()}
      />,
    );

    /* open the <details> panel */
    await user.click(screen.getByText(/advanced options/i));

    /* pick the 2nd revision from the dummy data */
    const { id: revId, label: revLabelText } = dummyRiffs[0].revisions![1];
    await user.click(screen.getByRole('radio', { name: revLabelText }));

    /* title input should include that revision id */
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput).toHaveValue(`${dummyRiffs[0].title} (rev ${revId})`);
  });

  it('restores the live version when "Current" is selected', async () => {
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        selectedId={dummyRiffs[0].id}
        riffs={dummyRiffs}
        setRiffs={vi.fn()}
      />,
    );

    /* open panel and switch to some revision first */
    await user.click(screen.getByText(/advanced options/i));
    const { label: revLabelText } = dummyRiffs[0].revisions![1];
    await user.click(screen.getByRole('radio', { name: revLabelText }));

    /* now click “Current” */
    await user.click(screen.getByRole('radio', { name: /current/i }));

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput).toHaveValue(dummyRiffs[0].title); // back to live value
  });
});
