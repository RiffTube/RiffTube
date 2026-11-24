import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AudioPanel from './AudioPanel';

class FakeRecorder {
  state: 'inactive' | 'recording' = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  start() {
    this.state = 'recording';
  }
  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['abc'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

const stopTrack = vi.fn();
const getUserMedia = vi.fn();

beforeEach(() => {
  stopTrack.mockClear();
  getUserMedia.mockReset();
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });
  vi.stubGlobal('MediaRecorder', FakeRecorder);
  URL.createObjectURL = vi.fn(() => 'blob:fake');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('<AudioPanel />', () => {
  it('starts with no audio and a Record button', () => {
    render(<AudioPanel />);
    expect(screen.getByText('No audio yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Record/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Delete/ })).toBeNull();
  });

  it('records from the mic until Stop, then offers playback', async () => {
    const user = userEvent.setup();
    const { container } = render(<AudioPanel />);

    await user.click(screen.getByRole('button', { name: /Record/ }));
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(screen.getByText(/Recording…/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Stop/ }));
    expect(stopTrack).toHaveBeenCalled();
    expect(container.querySelector('audio')).toHaveAttribute(
      'src',
      'blob:fake',
    );
    expect(
      screen.getByRole('button', { name: /Re-record/ }),
    ).toBeInTheDocument();
  });

  it('deletes the recording', async () => {
    const user = userEvent.setup();
    render(<AudioPanel />);
    await user.click(screen.getByRole('button', { name: /Record/ }));
    await user.click(screen.getByRole('button', { name: /Stop/ }));
    await user.click(screen.getByRole('button', { name: /Delete/ }));
    expect(screen.getByText('No audio yet')).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
  });

  it('explains when the microphone is blocked', async () => {
    getUserMedia.mockRejectedValue(new Error('denied'));
    const user = userEvent.setup();
    render(<AudioPanel />);
    await user.click(screen.getByRole('button', { name: /Record/ }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      /Microphone access was blocked/,
    );
    expect(screen.getByRole('button', { name: /Record/ })).toBeEnabled();
  });
});
