import { useState } from 'react';
import Button from '@/components/Button';

function AudioPanel() {
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
      {/* Waveform / placeholder */}
      <div className="flex h-24 items-center justify-center rounded-lg border-2 border-smoke bg-transparent">
        {hasAudio ? (
          /* Dummy waveform bar — swap for real waveform later */
          <div className="h-16 w-full animate-pulse rounded bg-gradient-to-r from-blue-500/60 to-purple-500/60" />
        ) : (
          <span className="text-white">No audio yet</span>
        )}
      </div>

      {/* Action Buttons */}
      {hasAudio ? (
        <div className="flex gap-4">
          <Button variant="secondary" onClick={handleRecord}>
            Re-record
          </Button>
          <Button variant="lightMode" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      ) : (
        <Button onClick={handleRecord}>● Record</Button>
      )}
    </section>
  );
}

export default AudioPanel;
