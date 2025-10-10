import { useEffect, useState } from 'react';
import ChannelAnalyticsCard from './cards/ChannelAnalyticsCard';
import ExploreRecommendationsCard from './cards/ExploreRecommendationsCard';
import {
  fakeLoad,
  fixtures,
  type ChannelAnalytics,
  type ExploreRecommendation,
} from './fixtures';

export default function HomeDashboard() {
  const [analytics, setAnalytics] = useState<ChannelAnalytics | null>(null);
  const [recs, setRecs] = useState<ExploreRecommendation[] | null>(null);

  useEffect(() => {
    let dead = false;
    Promise.all([
      fakeLoad(fixtures.channelAnalytics, 450),
      fakeLoad(fixtures.exploreRecommendations, 500),
    ]).then(([ca, er]) => {
      if (dead) return;
      setAnalytics(ca);
      setRecs(er);
    });
    return () => {
      dead = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <ChannelAnalyticsCard data={analytics} />
      </div>
      <div className="space-y-4">
        <ExploreRecommendationsCard items={recs} />
      </div>
    </div>
  );
}
