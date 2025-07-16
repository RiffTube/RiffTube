import { useState } from 'react';
import EditorWorkspace from '../../components/EditorWorkspace';
import RiffSidebar from '../../components/RiffSidebar';
import { dummyRiffs } from '../../data/dummyRiffs';

export default function EditorPage() {
  const [selectedId, setSelectedId] = useState(dummyRiffs[0].id);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <RiffSidebar
        riffs={dummyRiffs}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <EditorWorkspace selectedId={selectedId} />
    </div>
  );
}
