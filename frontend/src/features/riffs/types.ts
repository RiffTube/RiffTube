/** Free-form presentation settings stored with each riff version. */
export type RiffStyling = Record<string, unknown>;

/** A riff as the API returns it: placement, title and current version in one flat object. */
export interface Riff {
  id: string;
  /** Seconds from the start of the video. */
  start: number;
  end: number;
  title: string;
  text: string;
  styling: RiffStyling;
  /** Number of the current version. */
  version: number;
}

export function riffDuration(riff: Pick<Riff, 'start' | 'end'>): number {
  return Math.round((riff.end - riff.start) * 10) / 10;
}
