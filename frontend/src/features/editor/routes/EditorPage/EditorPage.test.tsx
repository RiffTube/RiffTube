import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorPage from './EditorPage';

describe('<EditorPage />', () => {
  it('renders the sidebar items and shows the first riff selected in the workspace', () => {
    render(<EditorPage />);

    // Sidebar should list all dummy riffs
    expect(screen.getByText('Bat dog ears joke')).toBeInTheDocument();
    expect(screen.getByText('Legs')).toBeInTheDocument();

    // The workspace "Name" input should show the first riff's title
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput).toHaveValue('Bat dog ears joke');
  });

  it('updates the workspace when a different riff is clicked in the sidebar', async () => {
    render(<EditorPage />);
    const user = userEvent.setup();

    // Click the second riff in the sidebar
    const secondSidebarItem = screen.getByText('Legs');
    await user.click(secondSidebarItem);

    // Workspace "Name" input should now show the second riff's title
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput).toHaveValue('Legs');
  });
});
