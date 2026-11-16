import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** The slice of the YouTube IFrame player the editor drives. */
export interface PlayerHandle {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

export interface PlayerController {
  /** Called by the player component once the video is ready (null on teardown). */
  register: (player: PlayerHandle | null) => void;
  /** Called by the player component as playback advances. */
  reportTime: (seconds: number) => void;
  /** The playhead right now, read from the player when there is one. */
  getTime: () => number;
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
}

const ControllerContext = createContext<PlayerController | null>(null);
const TimeContext = createContext(0);

/**
 * Shares one video player between the components of a page. The controller is
 * stable, so reading it never causes re-renders; the current time is a separate
 * context because it changes several times a second.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = useRef<PlayerHandle | null>(null);
  const lastTime = useRef(0);
  const [time, setTime] = useState(0);

  const reportTime = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds)) return;
    lastTime.current = seconds;
    setTime(seconds);
  }, []);

  const controller = useMemo<PlayerController>(
    () => ({
      register: next => {
        player.current = next;
      },
      reportTime,
      getTime: () => {
        const now = player.current?.getCurrentTime();
        return typeof now === 'number' && Number.isFinite(now)
          ? now
          : lastTime.current;
      },
      seekTo: seconds => {
        const target = Math.max(0, seconds);
        player.current?.seekTo(target, true);
        // Reflect the jump at once instead of waiting for the next poll.
        reportTime(target);
      },
      play: () => player.current?.playVideo(),
      pause: () => player.current?.pauseVideo(),
    }),
    [reportTime],
  );

  return (
    <ControllerContext.Provider value={controller}>
      <TimeContext.Provider value={time}>{children}</TimeContext.Provider>
    </ControllerContext.Provider>
  );
}

export function usePlayerController(): PlayerController {
  const controller = useContext(ControllerContext);
  if (!controller)
    throw new Error('usePlayerController must be used inside <PlayerProvider>');
  return controller;
}

/** The playhead in seconds; re-renders the caller as playback advances. */
export function usePlayerTime(): number {
  return useContext(TimeContext);
}
