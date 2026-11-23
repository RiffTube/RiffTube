import { useId, useState } from 'react';
import Button from '@/components/Button';
import { useRiffVersions } from '@/features/riffs/hooks';
import {
  overlayStyle,
  type Riff,
  type RiffVersion,
} from '@/features/riffs/types';

interface Props {
  /** The riff whose history is shown */
  riff: Pick<Riff, 'id' | 'version'>;
  /** The older version being looked at, if any */
  previewed: RiffVersion | null;
  /** Called with an older version to look at it, or null to go back to the current one */
  onPreview: (version: RiffVersion | null) => void;
  /** Makes a version current again. Resolves to false if the user backed out; rejects on failure. */
  onRestore: (versionId: string) => Promise<boolean>;
  isRestoring: boolean;
}

function savedAt(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
}

/**
 * The saved versions of a riff's text and styling. Older versions can be looked
 * at and restored; the history is only fetched once the panel is opened.
 */
function RevisionPanel({
  riff,
  previewed,
  onPreview,
  onRestore,
  isRestoring,
}: Props) {
  const [open, setOpen] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const panelId = useId();
  const versions = useRiffVersions(riff.id, open);

  const choose = (version: RiffVersion) => {
    setRestoreError(null);
    onPreview(version.version === riff.version ? null : version);
  };

  const restore = async (version: RiffVersion) => {
    setRestoreError(null);
    try {
      if (await onRestore(version.id)) onPreview(null);
    } catch {
      setRestoreError(
        `Version ${version.version} could not be restored. Nothing was changed.`,
      );
    }
  };

  return (
    <section className="text-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(current => !current)}
        className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[6px] py-2 font-medium text-paper select-none"
      >
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        Revision history
      </button>

      {open && (
        <div id={panelId} className="mt-2 space-y-3 pl-2">
          {versions.isPending && (
            <p role="status" className="text-muted-dark">
              Loading history…
            </p>
          )}

          {versions.isError && (
            <p role="alert" className="text-red-200">
              The revision history could not be loaded.{' '}
              <button
                type="button"
                onClick={() => void versions.refetch()}
                className="cursor-pointer underline hover:text-white"
              >
                Try again
              </button>
            </p>
          )}

          {versions.data && (
            <>
              <ul className="space-y-1">
                {versions.data.map(version => {
                  const isCurrent = version.version === riff.version;
                  const isChosen = previewed
                    ? previewed.id === version.id
                    : isCurrent;
                  return (
                    <li key={version.id}>
                      <label className="flex cursor-pointer items-baseline gap-2 rounded-[6px] px-1 py-1 hover:bg-white/5">
                        <input
                          type="radio"
                          name={`revision-${riff.id}`}
                          checked={isChosen}
                          onChange={() => choose(version)}
                          className="accent-gold"
                        />
                        <span className="shrink-0 font-medium">
                          Version {version.version}
                          {isCurrent && ' (current)'}
                        </span>
                        <span className="shrink-0 text-xs text-muted-dark tabular-nums">
                          {savedAt(version.createdAt)}
                        </span>
                        <span className="truncate text-muted-dark">
                          {version.text.trim() || 'No text'}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              {previewed && (
                <div className="space-y-2 rounded-[8px] border border-rule-dark bg-ink p-3">
                  <p className="text-xs text-muted-dark">
                    Version {previewed.version} looked like this:
                  </p>
                  <p
                    data-testid="revision-preview"
                    style={{
                      backgroundColor: overlayStyle(previewed.styling).bgColor,
                      color: overlayStyle(previewed.styling).textColor,
                      fontSize: overlayStyle(previewed.styling).fontSize,
                    }}
                    className="inline-block max-w-full rounded px-4 py-1 break-words whitespace-pre-wrap"
                  >
                    {previewed.text.trim() ? previewed.text : 'No text'}
                  </p>
                  <div>
                    <Button
                      size="sm"
                      variant="secondary"
                      // Keeps its name while the label is swapped for a spinner
                      aria-label="Restore this version"
                      isLoading={isRestoring}
                      onClick={() => void restore(previewed)}
                    >
                      Restore this version
                    </Button>
                  </div>
                </div>
              )}

              {restoreError && (
                <p role="alert" className="text-red-200">
                  {restoreError}
                </p>
              )}

              <p className="text-xs text-muted-dark">
                Restoring brings back a version’s text and styling as a new
                version. The riff’s name and timing stay as they are.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default RevisionPanel;
