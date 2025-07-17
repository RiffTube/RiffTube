import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RevisionPanel, { Revision } from './RevisionPanel';

describe('<RevisionPanel />', () => {
  it('renders only the "Current" radio when riff is null', () => {
    render(<RevisionPanel riff={null} />);
    const currentRadio = screen.getByLabelText('Current');
    expect(currentRadio).toBeInTheDocument();
    expect(currentRadio).toBeChecked();
    // There should be exactly one radio input
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('renders only the "Current" radio when riff has no revisions', () => {
    render(<RevisionPanel riff={{ id: 'r1' }} />);
    const currentRadio = screen.getByLabelText('Current');
    expect(currentRadio).toBeInTheDocument();
    expect(currentRadio).toBeChecked();
    expect(currentRadio).toHaveAttribute('name', 'revision-r1');
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('renders "Current" plus provided revisions', () => {
    const revisions: Revision[] = [
      { id: 'rev1', label: 'First' },
      { id: 'rev2', label: 'Second' },
    ];
    render(<RevisionPanel riff={{ id: 'r1', revisions }} />);

    const labels = screen
      .getAllByText(/Current|First|Second/)
      .map(el => el.textContent);
    expect(labels).toEqual(['Current', 'First', 'Second']);
    // Three radio inputs in total
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('calls onSelect with correct id when a revision is selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const revisions: Revision[] = [{ id: 'rev1', label: 'First' }];
    render(
      <RevisionPanel riff={{ id: 'r1', revisions }} onSelect={onSelect} />,
    );
    const firstRadio = screen.getByLabelText('First');
    await user.click(firstRadio);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('rev1');
    expect(firstRadio).toBeChecked();
  });

  it('resets selection back to "Current" when the riff changes', async () => {
    const user = userEvent.setup();
    const revisionsA: Revision[] = [{ id: 'rev1', label: 'First' }];

    const { rerender } = render(
      <RevisionPanel riff={{ id: 'a', revisions: revisionsA }} />,
    );

    // Select the "First" revision
    const firstRadio = screen.getByLabelText('First');
    await user.click(firstRadio);
    expect(firstRadio).toBeChecked();

    // Rerender with a new riff (no revisions)
    rerender(<RevisionPanel riff={{ id: 'b', revisions: [] }} />);
    const currentRadio = screen.getByLabelText('Current');
    expect(currentRadio).toBeChecked();

    // Old revision should no longer be in the document
    expect(screen.queryByLabelText('First')).toBeNull();
  });
});
