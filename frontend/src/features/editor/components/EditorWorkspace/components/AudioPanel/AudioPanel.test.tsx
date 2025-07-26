import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AudioPanel from './AudioPanel';

describe('<AudioPanel />', () => {
  it('renders the placeholder when no audio is present', () => {
    render(<AudioPanel />);
    // Should show the "No audio yet" message
    expect(screen.getByText('No audio yet')).toBeInTheDocument();
    // And a single "● Record" button
    expect(
      screen.getByRole('button', { name: /● Record/i }),
    ).toBeInTheDocument();
    // Should not show Re‑record or Delete buttons yet
    expect(screen.queryByRole('button', { name: /Re-record/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull();
  });

  it('shows waveform and action buttons after recording', async () => {
    const user = userEvent.setup();
    render(<AudioPanel />);
    // Click the Record button
    await user.click(screen.getByRole('button', { name: /● Record/i }));
    // Placeholder text should disappear
    expect(screen.queryByText('No audio yet')).toBeNull();
    // Record button should be replaced by Re‑record and Delete
    expect(
      screen.getByRole('button', { name: /Re-record/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    // The waveform div should be present (identified by its pulse animation class)
    const waveform = document.querySelector('.animate-pulse');
    expect(waveform).toBeInTheDocument();
  });

  it('allows deleting the recorded audio and returns to placeholder', async () => {
    const user = userEvent.setup();
    render(<AudioPanel />);
    // Record once
    await user.click(screen.getByRole('button', { name: /● Record/i }));
    // Now click Delete
    await user.click(screen.getByRole('button', { name: /Delete/i }));
    // Should go back to showing the placeholder
    expect(screen.getByText('No audio yet')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /● Record/i }),
    ).toBeInTheDocument();
    // Re‑record and Delete buttons should no longer be in the document
    expect(screen.queryByRole('button', { name: /Re-record/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull();
  });

  it('allows re-recording and keeps audio state', async () => {
    const user = userEvent.setup();
    render(<AudioPanel />);
    // Record once
    await user.click(screen.getByRole('button', { name: /● Record/i }));
    // Click Re‑record
    await user.click(screen.getByRole('button', { name: /Re-record/i }));
    // Should still show Re‑record and Delete
    expect(
      screen.getByRole('button', { name: /Re-record/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });
});
