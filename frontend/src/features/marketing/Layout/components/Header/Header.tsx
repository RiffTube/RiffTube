import { Link } from 'react-router-dom';
import TvIcon from '@/assets/rifftube-logo.svg?react';

interface HeaderProps {
  openSignIn: () => void;
}

function Header({ openSignIn }: HeaderProps) {
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
          <button
            type="button"
            onClick={openSignIn}
            className="cursor-pointer text-lg font-semibold text-white transition-colors hover:text-primary"
          >
            Sign In
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
