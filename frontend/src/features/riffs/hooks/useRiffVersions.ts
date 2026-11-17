import { useQuery } from '@tanstack/react-query';
import { fetchRiffVersions } from '../services/riffsApi';

export const riffVersionsQueryKey = (riffId: string) =>
  ['riffs', riffId, 'versions'] as const;

/** A riff's saved versions, newest first. Nothing is fetched until `enabled`. */
function useRiffVersions(riffId: string, enabled: boolean) {
  return useQuery({
    queryKey: riffVersionsQueryKey(riffId),
    queryFn: () => fetchRiffVersions(riffId),
    enabled,
  });
}

export default useRiffVersions;
