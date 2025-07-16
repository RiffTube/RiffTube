// src/features/projects/data/dummyRiffs.ts

/* ───────── Types ───────── */

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
    title: 'Bat dog ears joke',
    thumbnail: 'https://picsum.photos/id/237/200',
    start: 23.34,
    duration: 12,
    text: 'A funny joke about bat dogs',
    revisions: [
      { id: 'rev1', label: 'Mar 12, 11:02 AM' },
      { id: 'rev2', label: 'Mar 12, 11:01 AM' },
    ],
  },
  {
    id: 'r2',
    title: 'Legs',
    thumbnail: 'https://picsum.photos/id/238/200',
    start: 24.0,
    duration: 2,
    text: 'A riff about legs',
    revisions: [{ id: 'rev1', label: 'Mar 1, 09:45 AM' }],
  },
];

/* convenient single riff export for Storybook/tests */
export const riff = dummyRiffs[0];
