import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RiffSidebar, { SidebarRiff } from './RiffSidebar';

// 1) Mock Logo so we don’t need its implementation
vi.mock('@/components/Logo', () => ({
  default: () => <div data-testid="logo" />,
}));

describe('<RiffSidebar />', () => {
  const riffs: SidebarRiff[] = [
    {
      id: 'r1',
      title: 'First Riff',
      thumbnail: 'thumb1.jpg',
      start: 23.34,
      duration: 12,
    },
    {
      id: 'r2',
      title: 'Second Riff',
      thumbnail: 'thumb2.jpg',
      start: 61,
      duration: 3.5,
    },
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

  it('renders each thumbnail and you can assert src even though alt=""', () => {
    render(<RiffSidebar riffs={riffs} selectedId={null} onSelect={vi.fn()} />);
    // include hidden so that alt="" images are found
    const imgs = screen.getAllByRole('presentation') as HTMLImageElement[];
    expect(imgs).toHaveLength(2);

    expect(imgs[0]).toHaveAttribute('src', 'thumb1.jpg');
    expect(imgs[0]).toHaveAttribute('alt', '');

    expect(imgs[1]).toHaveAttribute('src', 'thumb2.jpg');
    expect(imgs[1]).toHaveAttribute('alt', '');
  });
});
