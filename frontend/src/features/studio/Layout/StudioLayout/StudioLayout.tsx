import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import StudioHeader from '../StudioHeader';
import StudioSidebar from '../StudioSidebar';
import MobileSidebar from '../StudioSidebar/components/MobileSidebar';

export default function StudioLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-paper">
      <StudioHeader onOpenMobileNav={() => setMobileOpen(true)} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-rule-dark md:block">
          <StudioSidebar />
        </aside>
        <main className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6">
          <Outlet />
        </main>
        <Link
          to="/dashboard/projects/new"
          className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-30 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-paper shadow-lg shadow-black/40 hover:bg-primary-dark md:hidden"
          aria-label="Create project"
        >
          Create
        </Link>
      </div>
    </div>
  );
}
