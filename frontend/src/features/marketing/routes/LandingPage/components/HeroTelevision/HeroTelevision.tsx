import { twMerge } from 'tailwind-merge';

/*
 * The RiffTube mark drawn large. Both outlines are taken from the first
 * contours of `assets/rifftube-logo.svg` (same 82 × 92 grid), so the antenna
 * angle, body radius and bulging screen match the logo exactly. The small
 * logo keeps its own traced file, which stays crisp at nav sizes.
 */

/** Body and antennae: the TV's outer silhouette. */
const SILHOUETTE =
  'M17.89 0.23C16.9 0.69 16.51 1.82 16.98 2.9C17.1 3.17 21.19 8.76 26.07 15.32' +
  'C30.95 21.88 34.93 27.26 34.92 27.27C34.91 27.28 29.13 27.34 22.08 27.4' +
  'C8.08 27.51 8.05 27.51 5.88 28.42C3.8 29.29 2.35 30.71 1.21 33' +
  'C0.07 35.27 0.15 33.18 0.15 59.83C0.15 86.54 0.07 84.44 1.25 86.73' +
  'C2.44 89.01 4.6 90.68 7.39 91.44L8.65 91.79H73.13L74.49 91.44' +
  'C78.9 90.31 81.39 87.45 81.84 82.99C82.05 80.98 82.05 39.03 81.85 36.91' +
  'C81.68 35.17 81.45 34.31 80.82 33.05C79.21 29.83 76.66 27.99 73.13 27.48' +
  'C72.49 27.39 67.07 27.33 59.65 27.33C48.97 27.32 47.24 27.29 47.31 27.11' +
  'C47.36 26.99 51.3 21.64 56.08 15.22C60.86 8.79 64.9 3.3 65.05 3.01' +
  'C65.42 2.3 65.33 1.29 64.84 0.76C63.94 -0.22 62.69 -0.25 61.69 0.69' +
  'C61.36 0.99 58.89 4.21 56.2 7.82C53.5 11.44 49.12 17.31 46.46 20.87' +
  'L41.62 27.34L40.3 27.25L33.27 17.77C21.6 2.01 20.65 0.76 20.18 0.43' +
  'C19.5 -0.04 18.63 -0.12 17.89 0.23Z';

/** The screen opening, with the logo's curved CRT edges. */
const SCREEN =
  'M53.1 34.03C64.75 34.84 68.05 35.4 70.5 37.01C73.06 38.68 74.12 40.99 74.79 46.37' +
  'C75.91 55.4 75.55 71.17 74.1 76.95C73.67 78.66 73.03 79.78 71.85 80.9' +
  'C69.51 83.12 66.58 83.86 57.58 84.52C44.01 85.52 25 85.13 16.46 83.67' +
  'C12.03 82.91 9.35 81.02 8.25 77.85C6.6 73.13 6.04 56.45 7.22 46.76' +
  'C7.86 41.43 8.73 39.16 10.73 37.55C13.1 35.65 16.09 35 26.02 34.22' +
  'C35 33.6 45 33.6 53.1 34.03Z';

/**
 * Where the photo is drawn: the screen's bounding box, made 25% taller
 * downward so the crop drops the unlit seat backs at the bottom of the photo
 * and the red-lit rows fill the screen.
 */
const PHOTO_BOX = { x: 6.2, y: 33.6, width: 69.6, height: 52.1 * 1.25 };

const CLIP_ID = 'rifftube-hero-screen';

interface Props {
  className?: string;
}

/**
 * Decorative only: hidden from assistive tech and never interactive, so it
 * can't be mistaken for a video player.
 */
function HeroTelevision({ className }: Props) {
  return (
    <svg
      viewBox="0 0 82 92"
      aria-hidden="true"
      focusable="false"
      className={twMerge(
        'pointer-events-none block h-auto select-none',
        className,
      )}
    >
      <defs>
        <clipPath id={CLIP_ID}>
          <path d={SCREEN} />
        </clipPath>
      </defs>

      <path d={SILHOUETTE} className="fill-ink" />

      <image
        href="/theater.png"
        {...PHOTO_BOX}
        preserveAspectRatio="xMidYMin slice"
        clipPath={`url(#${CLIP_ID})`}
      />
    </svg>
  );
}

export default HeroTelevision;
