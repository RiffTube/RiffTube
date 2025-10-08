import { useEffect, useRef } from 'react';
import StudioSidebar from '../../StudioSidebar';

export default function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const firstFocusable = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) firstFocusable.current?.focus();
  }, [open]);

  return (
    <div
      id="studio-mobile-drawer"
      aria-hidden={!open}
      className={[
        'fixed inset-0 z-40 md:hidden',
        open ? '' : 'pointer-events-none',
      ].join(' ')}
    >
      <div
        className={[
          'absolute inset-0 bg-black/60 transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={[
          'absolute top-0 left-0 h-full w-80 max-w-[85vw] border-r border-white/10 bg-backstage shadow-2xl',
          'transition-transform',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="text-sm font-semibold">Menu</span>
          <button
            ref={firstFocusable}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5"
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="p-2">
          <StudioSidebar />
        </div>
      </aside>
    </div>
  );
}
