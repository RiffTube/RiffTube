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
    <section className="space-y-3">
      {/* Waveform / placeholder */}
      <div className="flex h-24 items-center justify-center rounded-[8px] border border-dashed border-smoke bg-ink px-3">
        {hasAudio ? (
          /* Dummy waveform bar — swap for real waveform later */
          <div className="h-14 w-full animate-pulse rounded-[6px] bg-gradient-to-r from-primary/80 to-gold/60" />
        ) : (
          <span className="text-sm text-muted-dark">No audio yet</span>
        )}
      </div>

      {/* Action Buttons */}
      {hasAudio ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleRecord}>
            Re-record
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-[#f0a39c]"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      ) : (
        // The red dot is part of the label, so Record never relies on colour.
        <Button variant="secondary" size="sm" onClick={handleRecord}>
          <span className="text-[#e5544b]">●</span> Record
        </Button>
      )}
    </section>
  );
}

export default AudioPanel;
