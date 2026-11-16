import { useQuery } from '@tanstack/react-query';
import { fetchProject, fetchProjects } from '../services/projectsApi';

export const projectsQueryKey = ['projects'] as const;
export const projectQueryKey = (projectId: string) =>
  ['projects', projectId] as const;

export function useProjects() {
  return useQuery({ queryKey: projectsQueryKey, queryFn: fetchProjects });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectQueryKey(projectId ?? ''),
    queryFn: () => fetchProject(projectId!),
    enabled: Boolean(projectId),
  });
}
