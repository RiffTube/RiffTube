import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Modal from './Modal';

describe('Modal component', () => {
  it('renders children when open', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Test Content</div>
      </Modal>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={false} onClose={onClose}>
        <div>Test Content</div>
      </Modal>,
    );
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Test Content</div>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('forwards custom className to the panel', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} className="custom-class">
        <div>Test Content</div>
      </Modal>,
    );

    const panel = screen.getByText('Test Content').parentElement;
    expect(panel).toHaveClass('custom-class');
  });
});
