import { useState } from 'react';
import { DummyRiff } from '../../../data/dummyRiffs';

interface Props {
  riff: DummyRiff | null;
}

export default function AudioPanel({ riff }: Props) {
  // dummy flags; replace later with real recorder status + blob URL
  const [hasAudio, setHasAudio] = useState(false);

  /** Simulate a recording action */
  const handleRecord = () => {
    // TODO: integrate MediaRecorder here
    setHasAudio(true);
  };

  const handleDelete = () => {
    setHasAudio(false);
  };

  return (
    <section className="space-y-2">
      <h3 className="text-lg font-medium">
        Audio for {riff?.title ?? 'selected riff'}
      </h3>
      {/* Waveform / placeholder */}
      <div className="flex h-24 items-center justify-center rounded-lg bg-gray-800">
        {hasAudio ? (
          /* Dummy waveform bar — swap for real waveform later */
          <div className="h-16 w-full animate-pulse rounded bg-gradient-to-r from-blue-500/60 to-purple-500/60" />
        ) : (
          <span className="text-gray-500">No audio yet</span>
        )}
      </div>

      {/* Action buttons */}
      {hasAudio ? (
        <div className="flex gap-4">
          <button
            onClick={handleRecord}
            className="rounded bg-yellow-600 px-4 py-2 transition hover:bg-yellow-500"
          >
            Re‑record
          </button>
          <button
            onClick={handleDelete}
            className="rounded bg-gray-700 px-4 py-2 transition hover:bg-gray-600"
          >
            Delete
          </button>
        </div>
      ) : (
        <button
          onClick={handleRecord}
          className="rounded bg-red-600 px-4 py-2 transition hover:bg-red-500"
        >
          ● Record
        </button>
      )}
    </section>
  );
}
