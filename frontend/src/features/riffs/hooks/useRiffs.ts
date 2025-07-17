import { useEffect, useState } from 'react';
import { Riff } from '../components/RiffOverlay';
import { fetchRiffsForProject } from '../services/riffsApi';

function useRiffs(projectId: string): Riff[] {
  const [riffs, setRiffs] = useState<Riff[]>([]);

  useEffect(() => {
    if (!projectId) return;
    fetchRiffsForProject(projectId)
      .then(data => setRiffs(data.riffs))
      .catch(error => console.error(error));
  }, [projectId]);

  return riffs;
}

export default useRiffs;
