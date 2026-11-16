import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { makeRiff } from '@/testUtils/server';
import RiffControls from './RiffControls';

function renderControls(
  props: Partial<Parameters<typeof RiffControls>[0]> = {},
) {
  const handlers = {
    onChange: vi.fn(),
    onSave: vi.fn(),
    onRevert: vi.fn(),
    onDelete: vi.fn(),
  };
  render(
    <RiffControls
      riff={makeRiff({ title: 'Original title' })}
      isDirty={false}
      isSaving={false}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup() };
}

describe('<RiffControls />', () => {
  it('shows the riff name', () => {
    renderControls();

    expect(screen.getByLabelText(/name/i)).toHaveValue('Original title');
  });

  it('reports each keystroke in the name as a title change', async () => {
    const { onChange, user } = renderControls();

    await user.type(screen.getByLabelText(/name/i), '!');

    expect(onChange).toHaveBeenCalledWith({ title: 'Original title!' });
  });

  it('keeps Save and Undo changes disabled until something changed', () => {
    renderControls({ isDirty: false });

    expect(
      screen.getByRole('button', { name: /no changes to save/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /undo changes/i }),
    ).toBeDisabled();
  });

  it('saves, reverts and deletes through its buttons', async () => {
    const { onSave, onRevert, onDelete, user } = renderControls({
      isDirty: true,
    });

    await user.click(screen.getByRole('button', { name: /save riff/i }));
    await user.click(screen.getByRole('button', { name: /undo changes/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onRevert).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('cannot be saved twice while a save is on its way', () => {
    renderControls({ isDirty: true, isSaving: true });

    expect(screen.getByRole('button', { name: /save riff/i })).toBeDisabled();
  });
});
