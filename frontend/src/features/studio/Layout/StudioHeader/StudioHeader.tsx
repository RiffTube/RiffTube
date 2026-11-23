import { Link, useNavigate } from 'react-router-dom';
import TvIcon from '@/assets/rifftube-logo.svg?react';
import Button from '@/components/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function StudioHeader({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const { user, state, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username || user?.email || 'User';

  return (
    <header className="sticky top-0 z-20 border-b border-rule-dark bg-ink">
      <div className="mx-auto w-full max-w-7xl px-4 py-2.5">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border border-rule-dark hover:bg-white/5 md:hidden"
              aria-label="Open navigation"
              aria-controls="studio-mobile-drawer"
              aria-expanded="false"
            >
              <span className="sr-only">Open menu</span>
              {/* hamburger */}
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <Link
              className="hidden items-end gap-2 rounded-[6px] text-paper md:inline-flex"
              to={state === 'authorized' ? '/dashboard' : '/'}
              aria-label={
                state === 'authorized'
                  ? 'RiffTube: go to dashboard'
                  : 'RiffTube home'
              }
            >
              <TvIcon className="h-7 w-auto fill-current" aria-hidden="true" />
              <span className="font-serif text-[22px] leading-none">
                RiffTube
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="hidden md:inline"
              onClick={() => navigate('/dashboard/projects/new')}
            >
              Create project
            </Button>

            {state === 'authorized' ? (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  className="rounded-full"
                  to="/studio/settings"
                  title={user?.username ?? user?.email ?? 'User'}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
                    alt="avatar"
                    className="h-8 w-8 rounded-full ring-1 ring-rule-dark"
                  />
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="cursor-pointer rounded-[6px] px-2 py-1.5 text-sm font-medium text-muted-dark hover:text-paper"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="hidden rounded-[6px] px-2 py-1.5 text-sm font-medium text-paper hover:text-gold md:inline"
              >
                Sign in
              </Link>
            )}
          </div>

          <Link
            className="inline-flex items-end gap-2 rounded-[6px] text-paper md:hidden"
            to={state === 'authorized' ? '/dashboard' : '/'}
            aria-label={
              state === 'authorized'
                ? 'RiffTube: go to dashboard'
                : 'RiffTube home'
            }
          >
            <TvIcon className="h-6 w-auto fill-current" aria-hidden="true" />
            <span className="font-serif text-xl leading-none">RiffTube</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
