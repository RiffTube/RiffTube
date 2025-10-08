import { Link } from 'react-router-dom';
import TvIcon from '@/assets/rifftube-logo.svg?react';
import Button from '@/components/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function StudioHeader({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const { user, isAuthenticated, signOut } = useAuth();
  const displayName = user?.username || user?.email || 'User';

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-backstage">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 md:hidden"
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
              className="hidden md:inline"
              to={isAuthenticated ? '/dashboard' : '/'}
              aria-label={isAuthenticated ? 'Go to dashboard' : 'Home'}
            >
              <TvIcon
                className="h-7 w-auto fill-current text-white"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="hidden md:inline"
              onClick={() =>
                window.dispatchEvent(new CustomEvent('open-create-project'))
              }
            >
              Create project
            </Button>

            {isAuthenticated ? (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  to="/studio/settings"
                  title={user?.username ?? user?.email ?? 'User'}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
                    alt="avatar"
                    className="h-8 w-8 rounded-full"
                  />
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-sm font-medium text-white/80 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="hidden text-sm font-semibold text-white hover:text-primary md:inline"
              >
                Sign in
              </Link>
            )}
          </div>

          <Link
            className="md:hidden"
            to={isAuthenticated ? '/dashboard' : '/'}
            aria-label={isAuthenticated ? 'Go to dashboard' : 'Home'}
          >
            <TvIcon
              className="h-7 w-auto fill-current text-white"
              aria-hidden="true"
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}
