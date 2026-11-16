import { act, render, renderHook, screen } from '@testing-library/react';
import { vi } from 'vitest';
import {
  PlayerProvider,
  usePlayerController,
  usePlayerTime,
  type PlayerHandle,
} from './PlayerContext';

const fakePlayer = (time = 0): PlayerHandle => ({
  getCurrentTime: vi.fn(() => time),
  seekTo: vi.fn(),
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
});

const setup = () =>
  renderHook(
    () => ({ controller: usePlayerController(), time: usePlayerTime() }),
    { wrapper: PlayerProvider },
  );

describe('PlayerProvider', () => {
  it('reads the playhead from the registered player', () => {
    const { result } = setup();

    act(() => result.current.controller.register(fakePlayer(12.3)));

    expect(result.current.controller.getTime()).toBe(12.3);
  });

  it('falls back to the last reported time when there is no player', () => {
    const { result } = setup();

    act(() => result.current.controller.reportTime(4.5));

    expect(result.current.time).toBe(4.5);
    expect(result.current.controller.getTime()).toBe(4.5);
  });

  it('seeks the player, never before zero, and updates the time at once', () => {
    const { result } = setup();
    const player = fakePlayer();
    act(() => result.current.controller.register(player));

    act(() => result.current.controller.seekTo(-1));

    expect(player.seekTo).toHaveBeenCalledWith(0, true);
    expect(result.current.time).toBe(0);

    act(() => result.current.controller.seekTo(42));

    expect(player.seekTo).toHaveBeenLastCalledWith(42, true);
    expect(result.current.time).toBe(42);
  });

  it('plays and pauses the player', () => {
    const { result } = setup();
    const player = fakePlayer();
    act(() => result.current.controller.register(player));

    result.current.controller.play();
    result.current.controller.pause();

    expect(player.playVideo).toHaveBeenCalledTimes(1);
    expect(player.pauseVideo).toHaveBeenCalledTimes(1);
  });

  it('does nothing harmful before a player registers or after it leaves', () => {
    const { result } = setup();
    const player = fakePlayer(9);

    act(() => result.current.controller.register(player));
    act(() => result.current.controller.register(null));

    expect(() => {
      result.current.controller.play();
      result.current.controller.pause();
      act(() => result.current.controller.seekTo(3));
    }).not.toThrow();
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(result.current.controller.getTime()).toBe(3);
  });

  it('keeps the controller stable while the time changes', () => {
    const { result } = setup();
    const first = result.current.controller;

    act(() => result.current.controller.reportTime(1));
    act(() => result.current.controller.reportTime(2));

    expect(result.current.controller).toBe(first);
  });

  it('refuses to hand out a controller outside the provider', () => {
    const Lost = () => {
      usePlayerController();
      return null;
    };
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Lost />)).toThrow(/inside <PlayerProvider>/);
    expect(screen.queryByRole('alert')).toBeNull();
    quiet.mockRestore();
  });
});
