import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { makeRiff } from '@/testUtils/server';
import RiffSidebar from './RiffSidebar';

vi.mock('@/components/Logo', () => ({
  default: () => <div data-testid="logo" />,
}));

const riffs = [
  makeRiff({ id: 'r1', title: 'First Riff', start: 23.34, end: 35.3 }),
  makeRiff({ id: 'r2', title: 'Second Riff', start: 61, end: 64.5 }),
];

function renderSidebar(props: Partial<Parameters<typeof RiffSidebar>[0]> = {}) {
  const onSelect = vi.fn();
  render(
    <RiffSidebar
      riffs={riffs}
      selectedId={null}
      overlappingIds={new Set()}
      onSelect={onSelect}
      {...props}
    />,
  );
  return { onSelect, user: userEvent.setup() };
}

describe('<RiffSidebar />', () => {
  it('lists each riff with its name and time span', () => {
    renderSidebar();

    const [first, second] = screen.getAllByRole('button');
    expect(first).toHaveTextContent('First Riff');
    expect(first).toHaveTextContent('00:23.3 – 00:35.3');
    expect(second).toHaveTextContent('Second Riff');
    expect(second).toHaveTextContent('01:01.0 – 01:04.5');
  });

  it('marks the selected riff', () => {
    renderSidebar({ selectedId: 'r2' });

    const [first, second] = screen.getAllByRole('button');
    expect(first).not.toHaveAttribute('aria-current');
    expect(second).toHaveAttribute('aria-current', 'true');
  });

  it('calls onSelect with the riff that was clicked', async () => {
    const { onSelect, user } = renderSidebar();

    await user.click(screen.getByRole('button', { name: /second riff/i }));

    expect(onSelect).toHaveBeenCalledWith('r2');
  });

  it('flags the riffs that overlap another', () => {
    renderSidebar({ overlappingIds: new Set(['r2']) });

    const [first, second] = screen.getAllByRole('button');
    expect(first).not.toHaveTextContent(/overlaps/i);
    expect(second).toHaveTextContent(/overlaps/i);
  });

  it('falls back to the riff text, then a placeholder, when there is no title', () => {
    renderSidebar({
      riffs: [
        makeRiff({ id: 'r1', title: '', text: 'Just the text' }),
        makeRiff({ id: 'r2', title: '', text: '' }),
      ],
    });

    expect(screen.getByText('Just the text')).toBeInTheDocument();
    expect(screen.getByText('Untitled riff')).toBeInTheDocument();
  });

  it('says so when there are no riffs', () => {
    renderSidebar({ riffs: [] });

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText(/no riffs yet/i)).toBeInTheDocument();
  });
});
