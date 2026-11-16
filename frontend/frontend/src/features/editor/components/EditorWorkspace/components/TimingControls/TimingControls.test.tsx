import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { makeRiff } from '@/testUtils/server';
import TimingControls from './TimingControls';

function renderControls(
  props: Partial<Parameters<typeof TimingControls>[0]> = {},
) {
  const handlers = {
    onChange: vi.fn(() => true),
    onNudge: vi.fn(),
    onSetIn: vi.fn(),
    onSetOut: vi.fn(),
  };
  render(
    <TimingControls
      riff={makeRiff({ start: 5, end: 9.5 })}
      overlaps={false}
      isSaving={false}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup() };
}

describe('<TimingControls />', () => {
  it('shows start, end and the duration derived from them', () => {
    renderControls();

    expect(screen.getByLabelText('Start')).toHaveValue('00:05.0');
    expect(screen.getByLabelText('End')).toHaveValue('00:09.5');
    expect(screen.getByText('4.5s')).toBeInTheDocument();
  });

  it('reports a typed start or end as a change to that edge only', async () => {
    const { onChange, user } = renderControls();

    await user.clear(screen.getByLabelText('Start'));
    await user.type(screen.getByLabelText('Start'), '6.2{Enter}');
    await user.clear(screen.getByLabelText('End'));
    await user.type(screen.getByLabelText('End'), '0:12{Enter}');

    expect(onChange).toHaveBeenCalledWith({ start: 6.2 });
    expect(onChange).toHaveBeenLastCalledWith({ end: 12 });
  });

  it('nudges either edge by a tenth or a whole second', async () => {
    const { onNudge, user } = renderControls();

    await user.click(
      screen.getByRole('button', { name: 'Move start 0.1 seconds earlier' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Move start 1 second later' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Move end 1 second earlier' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Move end 0.1 seconds later' }),
    );

    expect(onNudge.mock.calls).toEqual([
      ['start', -0.1],
      ['start', 1],
      ['end', -1],
      ['end', 0.1],
    ]);
  });

  it('sets the in and out points from the playhead', async () => {
    const { onSetIn, onSetOut, user } = renderControls();

    await user.click(
      screen.getByRole('button', { name: /set start to playhead/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /set end to playhead/i }),
    );

    expect(onSetIn).toHaveBeenCalledTimes(1);
    expect(onSetOut).toHaveBeenCalledTimes(1);
  });

  it('says whether the timing is saved', () => {
    renderControls({ isSaving: true });

    expect(screen.getByRole('status')).toHaveTextContent(/saving timing/i);
  });

  it('warns only when the riff overlaps another', () => {
    const { rerender } = render(
      <TimingControls
        riff={makeRiff()}
        overlaps={false}
        isSaving={false}
        onChange={() => true}
        onNudge={vi.fn()}
        onSetIn={vi.fn()}
        onSetOut={vi.fn()}
      />,
    );
    expect(screen.queryByText(/overlaps another riff/i)).toBeNull();

    rerender(
      <TimingControls
        riff={makeRiff()}
        overlaps
        isSaving={false}
        onChange={() => true}
        onNudge={vi.fn()}
        onSetIn={vi.fn()}
        onSetOut={vi.fn()}
      />,
    );
    expect(screen.getByText(/overlaps another riff/i)).toBeInTheDocument();
  });
});
