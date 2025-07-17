import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { DummyRiff } from '../../../../data/dummyRiffs';
import RiffControls from './RiffControls';

const dummyRiff: DummyRiff = {
  id: 'r1',
  title: 'Original title',
  thumbnail: 'https://picsum.photos/200',
  start: 10,
  duration: 5,
  text: 'Some text',
};

describe('<RiffControls />', () => {
  it('returns null when riff is null', () => {
    const { container } = render(
      <RiffControls
        canSave={false}
        riff={null}
        onChange={vi.fn()}
        onUndo={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders inputs with the correct initial values', () => {
    render(
      <RiffControls
        canSave={true}
        riff={dummyRiff}
        onChange={vi.fn()}
        onUndo={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    const nameInput = screen.getByLabelText(/name/i);
    const durInput = screen.getByLabelText(/duration/i);

    expect(nameInput).toHaveValue(dummyRiff.title);
    expect(durInput).toHaveValue(String(dummyRiff.duration));
  });

  it('calls onChange once per keystroke as the user types', async () => {
    const onChange = vi.fn();
    render(
      <RiffControls
        canSave={false}
        riff={dummyRiff}
        onChange={onChange}
        onUndo={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const nameInput = screen.getByLabelText(/name/i);

    //  type "abc" → 3 calls

    await user.type(nameInput, 'abc');

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('fires onSave with only id, title & duration when Save is clicked', async () => {
    const onSave = vi.fn();
    render(
      <RiffControls
        canSave={true}
        riff={{ ...dummyRiff, title: 'Saved!' }}
        onChange={vi.fn()}
        onUndo={vi.fn()}
        onSave={onSave}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      id: dummyRiff.id,
      title: 'Saved!',
      duration: dummyRiff.duration,
    });
  });

  it('calls onUndo when Undo changes is clicked', async () => {
    const onUndo = vi.fn();
    render(
      <RiffControls
        canSave={true}
        riff={dummyRiff}
        onChange={vi.fn()}
        onUndo={onUndo}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /undo changes/i }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('prevents editing the read-only duration field', async () => {
    const onChange = vi.fn();
    render(
      <RiffControls
        canSave={false}
        riff={dummyRiff}
        onChange={onChange}
        onUndo={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const durInput = screen.getByLabelText(/duration/i);

    expect(durInput).toHaveAttribute('readOnly');
    await user.type(durInput, '123'); // Should do nothing
    expect(onChange).not.toHaveBeenCalled();
    expect(durInput).toHaveValue(String(dummyRiff.duration));
  });
});
