import { Link } from 'react-router-dom';
import TvIcon from '@/assets/rifftube-logo.svg?react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface HeaderProps {
  openSignIn: () => void;
}

export default function Header({ openSignIn }: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <header className="bg-backstage">
      <div className="container mx-auto max-w-screen-2xl px-4 py-4">
        <nav
          className="mx-auto flex w-full items-center justify-between"
          aria-label="Main navigation"
        >
          <Link to="/" aria-label="Home">
            <TvIcon
              className="h-8 w-auto fill-current text-white"
              aria-hidden="true"
            />
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.username,
                )}&background=random`}
                alt="avatar"
                className="h-8 w-8 rounded-full"
              />
              <span className="text-white">{user.username}</span>
              <button
                type="button"
                onClick={signOut}
                className="cursor-pointer text-lg font-semibold text-white transition-colors hover:text-primary"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openSignIn}
              className="cursor-pointer text-lg font-semibold text-white transition-colors hover:text-primary"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
