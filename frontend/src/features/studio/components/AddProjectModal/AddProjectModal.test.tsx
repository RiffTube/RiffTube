import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AddProjectModal from './AddProjectModal';

describe('<AddProjectModal />', () => {
  it('renders heading and the add-project form fields', () => {
    render(<AddProjectModal isOpen onClose={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: /new project/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/youtube url/i)).toBeInTheDocument();
  });

  it('pre-fills the YouTube URL from initialYoutubeUrl', () => {
    render(
      <AddProjectModal
        isOpen
        onClose={vi.fn()}
        initialYoutubeUrl="https://youtu.be/dQw4w9WgXcQ"
      />,
    );

    expect(screen.getByLabelText(/youtube url/i)).toHaveValue(
      'https://youtu.be/dQw4w9WgXcQ',
    );
  });

  it('renders nothing visible when closed', () => {
    render(<AddProjectModal isOpen={false} onClose={vi.fn()} />);

    expect(
      screen.queryByRole('heading', { name: /new project/i }),
    ).not.toBeInTheDocument();
  });
});
