import { useEffect, useRef, useState } from 'react';
import Button from '@/components/Button';

type Status = 'idle' | 'requesting' | 'recording' | 'recorded' | 'error';

function formatElapsed(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Records a riff's audio from the microphone in the browser.
 *
 * The recording lives only in this tab for now: the backend has no place to
 * store audio yet, so it is gone after a reload or when another riff is picked.
 */
function AudioPanel() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const urlRef = useRef<string | null>(null);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const releaseMic = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const replaceUrl = (url: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
    setAudioUrl(url);
  };

  // Let go of the mic and the recording when the panel goes away.
  useEffect(
    () => () => {
      stopTimer();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        recorder.stop();
      }
      releaseMic();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const startRecording = async () => {
    setError(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setError('This browser can’t record audio.');
      setStatus('error');
      return;
    }

    setStatus('requesting');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(
        'Microphone access was blocked. Allow it in your browser’s site settings and try again.',
      );
      setStatus('error');
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = event => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      stopTimer();
      releaseMic();
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });
      chunksRef.current = [];
      if (blob.size === 0) {
        setError('Nothing was recorded. Check your microphone and try again.');
        setStatus('error');
        return;
      }
      replaceUrl(URL.createObjectURL(blob));
      setStatus('recorded');
    };

    recorder.start();
    const startedAt = Date.now();
    setElapsed(0);
    timerRef.current = window.setInterval(
      () => setElapsed(Date.now() - startedAt),
      250,
    );
    setStatus('recording');
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  };

  const handleDelete = () => {
    replaceUrl(null);
    setStatus('idle');
  };

  return (
    <section className="space-y-3" aria-label="Riff audio">
      <div className="flex min-h-24 items-center justify-center rounded-[8px] border border-dashed border-smoke bg-ink px-3 py-3">
        {status === 'recording' ? (
          <span
            className="flex items-center gap-2 text-sm text-paper"
            role="status"
          >
            <span className="size-2.5 animate-pulse rounded-full bg-[#e5544b]" />
            Recording…{' '}
            <span className="font-mono tabular-nums">
              {formatElapsed(elapsed)}
            </span>
          </span>
        ) : status === 'recorded' && audioUrl ? (
          <audio controls src={audioUrl} className="w-full" />
        ) : status === 'requesting' ? (
          <span className="text-sm text-muted-dark">
            Waiting for microphone…
          </span>
        ) : (
          <span className="text-sm text-muted-dark">No audio yet</span>
        )}
      </div>

      {error && (
        <p className="text-sm text-[#f0a39c]" role="alert">
          {error}
        </p>
      )}

      {status === 'recording' ? (
        <Button variant="secondary" size="sm" onClick={stopRecording}>
          <span className="text-[#e5544b]">■</span> Stop
        </Button>
      ) : status === 'recorded' ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={startRecording}>
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
        <Button
          variant="secondary"
          size="sm"
          onClick={startRecording}
          disabled={status === 'requesting'}
        >
          <span className="text-[#e5544b]">●</span> Record
        </Button>
      )}
    </section>
  );
}

export default AudioPanel;
