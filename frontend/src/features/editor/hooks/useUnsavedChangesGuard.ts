import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export const DISCARD_PROMPT = 'Discard your unsaved changes to this riff?';

/**
 * Asks before unsaved work is left behind, however the user leaves: a link, the
 * browser's Back and Forward buttons, or closing the tab.
 *
 * @param hasUnsavedChanges work only the user can save (or discard)
 * @param hasSavesInProgress work that is saving by itself. Moving around the
 *   app does not interrupt it, but closing the tab can, so only that is guarded.
 */
export function useUnsavedChangesGuard(
  hasUnsavedChanges: boolean,
  hasSavesInProgress = false,
): void {
  // In-app navigation, including history navigation.
  const blocker = useBlocker(hasUnsavedChanges);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(DISCARD_PROMPT)) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  // Closing or reloading the tab; the browser shows its own wording.
  const warnOnClose = hasUnsavedChanges || hasSavesInProgress;
  useEffect(() => {
    if (!warnOnClose) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [warnOnClose]);
}
