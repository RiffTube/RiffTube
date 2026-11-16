import { Link } from 'react-router-dom';
import TvIcon from '@/assets/rifftube-logo.svg?react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface HeaderProps {
  openSignIn: () => void;
}

export default function Header({ openSignIn }: HeaderProps) {
  const { user, state, signOut } = useAuth();

  const logoHref = state === 'authorized' && user ? '/dashboard' : '/';
  const logoLabel = state === 'authorized' && user ? 'Go to dashboard' : 'Home';

  return (
    <header className="border-b border-outline bg-backstage">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <nav
          className="flex w-full items-center justify-between"
          aria-label="Main navigation"
        >
          <Link
            to={logoHref}
            aria-label={logoLabel}
            className="inline-flex items-center gap-2"
          >
            <TvIcon
              className="h-7 w-auto fill-current text-flicker-white"
              aria-hidden="true"
            />
          </Link>

          {state === 'authorized' && user ? (
            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.username,
                )}&background=random`}
                alt="avatar"
                className="h-8 w-8 rounded-full ring-1 ring-outline"
              />
              <span className="text-flicker-white/90">{user.username}</span>
              <button
                type="button"
                onClick={signOut}
                className="cursor-pointer text-sm font-semibold text-flicker-white transition-colors hover:text-popcorn-butter"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openSignIn}
              className="cursor-pointer text-sm font-semibold text-flicker-white transition-colors hover:text-popcorn-butter"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
