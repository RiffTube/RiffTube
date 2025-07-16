import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Modal from './Modal';

describe('Modal component', () => {
  it('renders children when open', async () => {
    render(
      <Modal isOpen onClose={vi.fn()} className="custom-class">
        <div>Test Content</div>
      </Modal>,
    );

    // findBy waits for mount/transition to settle
    expect(await screen.findByText('Test Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Test Content</div>
      </Modal>,
    );

    expect(screen.queryByText('Test Content')).toBeNull();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen onClose={onClose}>
        <div>Test Content</div>
      </Modal>,
    );

    await userEvent.keyboard('{Escape}'); // wrapped in act internally
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('forwards custom className to the panel', async () => {
    render(
      <Modal isOpen onClose={vi.fn()} className="custom-class">
        <div>Test Content</div>
      </Modal>,
    );

    const panel = await screen.findByText('Test Content');
    expect(panel.parentElement).toHaveClass('custom-class');
  });
});
