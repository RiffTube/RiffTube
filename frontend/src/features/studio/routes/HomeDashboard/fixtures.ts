import { seededThumb } from '@/helpers/thumbnails';

export type Project = {
  id: string;
  title: string;
  updatedAt: string;
  thumbnailUrl?: string;
};
export type Riff = { id: string; title: string; updatedAt: string };
export type Activity = { id: string; summary: string; at: string };
export type Subscription = {
  status: 'free' | 'trial' | 'pro';
  trialEndsAt?: string;
  renewsAt?: string;
};

export type ChannelAnalytics = {
  subscribers: number;
  views: number;
  topVideo?: { id: string; title: string } | null;
};

export type ExploreRecommendation = {
  id: string;
  title: string;
  author: string;
  thumbnailUrl?: string;
};

const now = Date.now();
const isoAgo = (hrs: number) => new Date(now - hrs * 3600_000).toISOString();

export const fixtures = {
  ownedProjects: [
    { id: 'p1', title: 'Guitar Solo Breakdown', updatedAt: isoAgo(1) },
    { id: 'p2', title: 'Pixar Openings: Hooks', updatedAt: isoAgo(5) },
    { id: 'p3', title: 'World Record Deep Dive', updatedAt: isoAgo(12) },
    { id: 'p4', title: 'Camera Moves Explained', updatedAt: isoAgo(23) },
    { id: 'p5', title: 'Comedy Cuts 101', updatedAt: isoAgo(27) },
  ] as Project[],

  collabProjects: [
    { id: 'c1', title: 'Trailer Breakdown (Alex)', updatedAt: isoAgo(8) },
    { id: 'c2', title: 'ThinkSync Collab', updatedAt: isoAgo(36) },
  ] as Project[],

  recentRiffs: [
    { id: 'r1', title: 'Beat 3: add SFX rise', updatedAt: isoAgo(2) },
    { id: 'r2', title: 'Alt hook line', updatedAt: isoAgo(6) },
    { id: 'r3', title: 'Tighten VO timing', updatedAt: isoAgo(10) },
  ] as Riff[],

  activity: [
    {
      id: 'a1',
      summary: 'You updated “Guitar Solo Breakdown”.',
      at: isoAgo(1),
    },
    {
      id: 'a2',
      summary: 'Alex shared “Trailer Breakdown” with you.',
      at: isoAgo(8),
    },
    { id: 'a3', summary: 'Comment added on “Alt hook line”.', at: isoAgo(14) },
  ] as Activity[],

  subscription: { status: 'free' } as Subscription, // switch to 'trial' or 'pro' to test UI

  channelAnalytics: {
    subscribers: 1_280,
    views: 45_213,
    topVideo: { id: 'p2', title: 'Pixar Openings: Hooks' },
  } as ChannelAnalytics,
  exploreRecommendations: [
    {
      id: 'e1',
      title: 'How Pixar Hooks You in 5 Minutes',
      author: 'PixelPundit',
      thumbnailUrl: seededThumb('pixar hooks theater'),
    },
    {
      id: 'e2',
      title: 'Why This Guitar Solo Still Shreds',
      author: 'ThinkSync',
      thumbnailUrl: seededThumb('guitar solo shreds'),
    },
    {
      id: 'e3',
      title: 'World Record Breakdown',
      author: 'DeepDiveDan',
      thumbnailUrl: seededThumb('world record breakdown'),
    },
  ] as ExploreRecommendation[],
};

export function fakeLoad<T>(value: T, delay = 500): Promise<T> {
  return new Promise(res => setTimeout(() => res(value), delay));
}
