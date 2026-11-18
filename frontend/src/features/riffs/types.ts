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

/** One saved state of a riff's text and styling. Titles and timing are not versioned. */
export interface RiffVersion {
  id: string;
  /** 1 for the first version, counting up */
  version: number;
  text: string;
  styling: RiffStyling;
  /** ISO timestamp of when it was saved */
  createdAt: string;
}

/** The parts of a riff that are versioned and saved explicitly. */
export type RiffContent = Pick<Riff, 'title' | 'text' | 'styling'>;
/** The parts of a riff that live on its placement and autosave. */
export type RiffTiming = Pick<Riff, 'start' | 'end'>;

/** Times are edited and stored to a tenth of a second. */
export const TIME_STEP = 0.1;
export const DEFAULT_RIFF_SECONDS = 3;

export function roundTime(seconds: number): number {
  return Math.round(seconds * 10) / 10;
}

export function riffDuration(riff: RiffTiming): number {
  return roundTime(riff.end - riff.start);
}

/** The styling the editor understands, with the overlay's defaults filled in. */
export interface OverlayStyle {
  bgColor: string;
  textColor: string;
  fontSize: number;
}

export const DEFAULT_OVERLAY_STYLE: OverlayStyle = {
  bgColor: '#000000',
  textColor: '#ffffff',
  fontSize: 16,
};

export function overlayStyle(styling: RiffStyling | undefined): OverlayStyle {
  const { bgColor, textColor, fontSize } = styling ?? {};
  return {
    bgColor:
      typeof bgColor === 'string' ? bgColor : DEFAULT_OVERLAY_STYLE.bgColor,
    textColor:
      typeof textColor === 'string'
        ? textColor
        : DEFAULT_OVERLAY_STYLE.textColor,
    fontSize:
      typeof fontSize === 'number' && fontSize > 0
        ? fontSize
        : DEFAULT_OVERLAY_STYLE.fontSize,
  };
}

export function sortByStart<T extends RiffTiming>(riffs: T[]): T[] {
  return [...riffs].sort((a, b) => a.start - b.start || a.end - b.end);
}

/** Ids of every riff that shares screen time with another one. */
export function overlappingRiffIds(
  riffs: (RiffTiming & Pick<Riff, 'id'>)[],
): Set<string> {
  const sorted = sortByStart(riffs);
  const ids = new Set<string>();

  // Compare each riff with the one that ends latest so far, so a long riff
  // spanning several short ones is caught as well as neighbours.
  let latest = sorted[0];
  for (const riff of sorted.slice(1)) {
    if (riff.start < latest.end) {
      ids.add(riff.id);
      ids.add(latest.id);
    }
    if (riff.end > latest.end) latest = riff;
  }

  return ids;
}
