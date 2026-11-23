import { Link } from 'react-router-dom';
import TvIcon from '@/assets/rifftube-logo.svg?react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface HeaderProps {
  openSignIn: () => void;
}

const utilityAction =
  'cursor-pointer rounded-[6px] px-2 py-1.5 text-sm font-medium text-paper transition-colors hover:text-gold';

export default function Header({ openSignIn }: HeaderProps) {
  const { user, state, signOut } = useAuth();

  const signedIn = state === 'authorized' && !!user;
  const logoHref = signedIn ? '/dashboard' : '/';
  // Starts with the visible wordmark so voice control users can say it.
  const logoLabel = signedIn ? 'RiffTube: go to dashboard' : 'RiffTube home';

  return (
    <header className="bg-ink text-paper">
      <nav
        className="page-grid flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          to={logoHref}
          aria-label={logoLabel}
          className="-mx-1 inline-flex items-end gap-2 rounded-[6px] px-1 py-1"
        >
          <TvIcon className="h-7 w-auto fill-current" aria-hidden="true" />
          <span className="font-serif text-[22px] leading-none">RiffTube</span>
        </Link>

        {signedIn ? (
          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.username,
              )}&background=random`}
              alt="avatar"
              className="h-8 w-8 rounded-full ring-1 ring-rule-dark"
            />
            <span className="text-sm text-muted-dark">{user.username}</span>
            <button type="button" onClick={signOut} className={utilityAction}>
              Sign out
            </button>
          </div>
        ) : (
          <button type="button" onClick={openSignIn} className={utilityAction}>
            Sign in
          </button>
        )}
      </nav>
    </header>
  );
}
