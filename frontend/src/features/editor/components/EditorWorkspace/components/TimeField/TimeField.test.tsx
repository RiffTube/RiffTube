import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TimeField from './TimeField';

function renderField(value = 83.4, accept = true) {
  const onCommit = vi.fn(() => accept);
  const view = render(
    <TimeField id="start" label="Start" value={value} onCommit={onCommit} />,
  );
  const rerender = (next: number) =>
    view.rerender(
      <TimeField id="start" label="Start" value={next} onCommit={onCommit} />,
    );
  return { onCommit, rerender, user: userEvent.setup() };
}

const field = () => screen.getByLabelText('Start');

describe('<TimeField />', () => {
  it('shows the time as mm:ss.s', () => {
    renderField(83.4);

    expect(field()).toHaveValue('01:23.4');
  });

  it('commits a typed time on Enter', async () => {
    const { onCommit, user } = renderField();

    await user.clear(field());
    await user.type(field(), '1:30{Enter}');

    expect(onCommit).toHaveBeenCalledWith(90);
  });

  it('commits on blur', async () => {
    const { onCommit, user } = renderField();

    await user.clear(field());
    await user.type(field(), '12.5');
    await user.tab();

    expect(onCommit).toHaveBeenCalledWith(12.5);
  });

  it('does not commit a time that has not changed', async () => {
    const { onCommit, user } = renderField(83.4);

    await user.click(field());
    await user.tab();

    expect(onCommit).not.toHaveBeenCalled();
    expect(field()).toHaveValue('01:23.4');
  });

  it('flags text that is not a time and leaves it there to be fixed', async () => {
    const { onCommit, user } = renderField();

    await user.clear(field());
    await user.type(field(), 'soon{Enter}');

    expect(onCommit).not.toHaveBeenCalled();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveValue('soon');
    expect(screen.getByText(/use mm:ss\.s/i)).toBeInTheDocument();
  });

  it('goes back to the real time when the new one is refused', async () => {
    const { onCommit, user } = renderField(83.4, false);

    await user.clear(field());
    await user.type(field(), '5{Enter}');

    expect(onCommit).toHaveBeenCalledWith(5);
    expect(field()).toHaveValue('01:23.4');
  });

  it('restores the time on Escape without passing the key on', async () => {
    const onKeyDown = vi.fn();
    const onCommit = vi.fn(() => true);
    render(
      <div onKeyDown={onKeyDown}>
        <TimeField id="start" label="Start" value={83.4} onCommit={onCommit} />
      </div>,
    );
    const user = userEvent.setup();

    await user.clear(field());
    await user.type(field(), '99{Escape}');

    expect(field()).toHaveValue('01:23.4');
    expect(onKeyDown).not.toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Escape' }),
    );
  });

  it('follows the value when it changes from outside', () => {
    const { rerender } = renderField(5);

    rerender(5.1);

    expect(field()).toHaveValue('00:05.1');
  });
});
