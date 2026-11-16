import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeRiff } from '@/testUtils/server';
import RiffSidebar from './RiffSidebar';

// 1) Mock Logo so we don’t need its implementation
vi.mock('@/components/Logo', () => ({
  default: () => <div data-testid="logo" />,
}));

describe('<RiffSidebar />', () => {
  const riffs = [
    makeRiff({ id: 'r1', title: 'First Riff', start: 23.34, end: 35.34 }),
    makeRiff({ id: 'r2', title: 'Second Riff', start: 61, end: 64.5 }),
  ];

  it('renders the Logo', () => {
    render(<RiffSidebar riffs={riffs} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders one <li> per riff with correct title and timestamp', () => {
    render(<RiffSidebar riffs={riffs} selectedId={null} onSelect={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(screen.getByText('First Riff')).toBeInTheDocument();

    expect(screen.getByText('00:23 •12s')).toBeInTheDocument();

    expect(screen.getByText('Second Riff')).toBeInTheDocument();

    expect(screen.getByText('01:01 •4s')).toBeInTheDocument();
  });

  it('only the selected riff has `border-white`', () => {
    render(<RiffSidebar riffs={riffs} selectedId="r2" onSelect={vi.fn()} />);
    const firstItem = screen.getByText('First Riff').closest('li');
    const secondItem = screen.getByText('Second Riff').closest('li');
    expect(firstItem).toHaveClass('border-transparent');
    expect(secondItem).toHaveClass('border-white');
  });

  it('invokes onSelect with the correct id when clicked', async () => {
    const onSelect = vi.fn();
    render(<RiffSidebar riffs={riffs} selectedId={null} onSelect={onSelect} />);
    const user = userEvent.setup();

    const firstItem = screen.getByText('First Riff').closest('li')!;
    await user.click(firstItem);
    expect(onSelect).toHaveBeenCalledWith('r1');
  });

  it('falls back to the riff text, then a placeholder, when there is no title', () => {
    render(
      <RiffSidebar
        riffs={[
          makeRiff({ id: 'r1', title: '', text: 'Just the text' }),
          makeRiff({ id: 'r2', title: '', text: '' }),
        ]}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText('Just the text')).toBeInTheDocument();
    expect(screen.getByText('Untitled riff')).toBeInTheDocument();
  });

  it('says so when there are no riffs', () => {
    render(<RiffSidebar riffs={[]} selectedId={null} onSelect={vi.fn()} />);

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText(/no riffs yet/i)).toBeInTheDocument();
  });
});
