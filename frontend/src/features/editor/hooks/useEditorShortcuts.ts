import { useCallback, type KeyboardEvent } from 'react';
import type { RiffEditor } from './useRiffEditor';

const FINE_STEP = 0.1;
const COARSE_STEP = 1;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

/**
 * Keyboard shortcuts for the editor, as a keydown handler for its container.
 * (The YouTube iframe keeps key presses to itself while it has focus, so the
 * shortcuts work whenever focus is anywhere else in the editor.)
 *
 * Cmd/Ctrl+S saves and Esc reverts from anywhere, including text fields. The
 * single-key shortcuts are ignored while typing.
 */
export function useEditorShortcuts(editor: RiffEditor) {
  const {
    save,
    revert,
    isDirty,
    addAtPlayhead,
    setInPoint,
    setOutPoint,
    nudge,
  } = editor;

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (modifier && key === 's') {
        event.preventDefault();
        void save();
        return;
      }

      if (key === 'escape') {
        if (isDirty) {
          event.preventDefault();
          revert();
        }
        return;
      }

      if (modifier || event.altKey || isTyping(event.target)) return;

      const step = event.shiftKey ? COARSE_STEP : FINE_STEP;
      const actions: Record<string, () => void> = {
        t: () => void addAtPlayhead(),
        i: setInPoint,
        o: setOutPoint,
        arrowleft: () => nudge('both', -step),
        arrowright: () => nudge('both', step),
      };

      const action = actions[key];
      if (!action) return;
      event.preventDefault();
      action();
    },
    [save, revert, isDirty, addAtPlayhead, setInPoint, setOutPoint, nudge],
  );
}
