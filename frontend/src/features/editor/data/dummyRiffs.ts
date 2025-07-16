// src/features/projects/data/dummyRiffs.ts
export interface DummyRiff {
  id: string;
  title: string;
  thumbnail: string;
  start: number;
  duration: number;
  text?: string;
}

export const dummyRiffs: DummyRiff[] = [
  {
    id: 'r1',
    title: 'Bat dog ears joke',
    thumbnail: 'https://picsum.photos/id/237/200',
    start: 23.34,
    duration: 12,
    text: 'A funny joke about bat dogs',
  },
  {
    id: 'r2',
    title: 'Legs',
    thumbnail: 'https://picsum.photos/id/238/200',
    start: 24.0,
    duration: 2,
    text: 'A riff about legs',
  },
];

export const riff = dummyRiffs[0];
