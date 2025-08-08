import { useState } from 'react';
import EditorWorkspace from '../../components/EditorWorkspace';
import RiffSidebar from '../../components/RiffSidebar';
import { dummyRiffs } from '../../data/dummyRiffs';

function EditorPage() {
  const [riffs, setRiffs] = useState(dummyRiffs);
  const [selectedId, setSelectedId] = useState<string | null>(riffs[0].id);
  return (
    <div className="flex h-screen bg-backstage text-white">
      <RiffSidebar
        riffs={riffs}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <EditorWorkspace
        riffs={riffs}
        setRiffs={setRiffs}
        selectedId={selectedId}
      />
    </div>
  );
}
export default EditorPage;
