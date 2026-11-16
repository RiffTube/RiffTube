import { useQuery } from '@tanstack/react-query';
import { fetchRiffsForProject } from '../services/riffsApi';

export const riffsQueryKey = (projectId: string) =>
  ['projects', projectId, 'riffs'] as const;

function useRiffs(projectId: string | undefined) {
  return useQuery({
    queryKey: riffsQueryKey(projectId ?? ''),
    queryFn: () => fetchRiffsForProject(projectId!),
    enabled: Boolean(projectId),
  });
}

export default useRiffs;
