export interface Revision {
  id: string; // backend will map to riff_versions.id
  label: string; // human‑readable (e.g. timestamp or “v2”)
}

export interface DummyRiff {
  id: string;
  title: string;
  thumbnail: string;
  start: number;
  duration: number;
  text?: string;
  revisions?: Revision[]; // ← new
}

/* ───────── Dummy data ───────── */

export const dummyRiffs: DummyRiff[] = [
  {
    id: 'r1',
    title: 'wait',
    thumbnail: 'https://picsum.photos/id/237/200',
    start: 5,
    duration: 4,
    text: 'Wait for it...',
    revisions: [
      { id: 'rev1', label: 'Mar 12, 11:02 AM' },
      { id: 'rev2', label: 'Mar 12, 11:01 AM' },
    ],
  },
  {
    id: 'r2',
    title: 'Classic',
    thumbnail: 'https://picsum.photos/id/238/200',
    start: 18,
    duration: 7,
    text: '😂 Classic!',
    revisions: [{ id: 'rev1', label: 'Mar 1, 09:45 AM' }],
  },
];

/* convenient single riff export for Storybook/tests */
export const riff = dummyRiffs[0];
