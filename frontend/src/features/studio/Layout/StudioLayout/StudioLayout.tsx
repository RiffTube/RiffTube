import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  dispatchOpenCreate,
  OPEN_CREATE_EVENT,
  type OpenCreateDetail,
} from '@/helpers/events';
import AddProjectModal from '../../components/AddProjectModal';
import StudioHeader from '../StudioHeader';
import StudioSidebar from '../StudioSidebar';
import MobileSidebar from '../StudioSidebar/components/MobileSidebar';

export default function StudioLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [initialYoutubeUrl, setInitialYoutubeUrl] = useState('');

  useEffect(() => {
    const handleOpenCreate = (e: Event) => {
      const detail = (e as CustomEvent<OpenCreateDetail>).detail;
      setInitialYoutubeUrl(detail?.youtubeUrl ?? '');
      setAddProjectOpen(true);
    };
    window.addEventListener(OPEN_CREATE_EVENT, handleOpenCreate);
    return () =>
      window.removeEventListener(OPEN_CREATE_EVENT, handleOpenCreate);
  }, []);

  return (
    <div className="min-h-screen bg-backstage text-white">
      <StudioHeader onOpenMobileNav={() => setMobileOpen(true)} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-white/10 md:block">
          <StudioSidebar />
        </aside>
        <main className="min-h-[calc(100vh-56px)] px-3 py-3 sm:px-4">
          <Outlet />
        </main>
        <button
          onClick={() => dispatchOpenCreate()}
          className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-30 rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:bg-rose-600 md:hidden"
          aria-label="Create project"
        >
          Create
        </button>
      </div>
      <AddProjectModal
        isOpen={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        initialYoutubeUrl={initialYoutubeUrl}
      />
    </div>
  );
}
