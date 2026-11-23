import { Link, NavLink } from 'react-router-dom';

/*
 * One current-page marker: a charcoal fill and a gold bar on the left edge,
 * driven by aria-current so what is seen and what is announced agree.
 */
const link =
  'block rounded-[6px] px-3 py-2.5 text-sm text-muted-dark transition-colors hover:bg-white/5 hover:text-paper ' +
  'aria-[current=page]:bg-charcoal aria-[current=page]:font-semibold aria-[current=page]:text-paper ' +
  'aria-[current=page]:shadow-[inset_3px_0_0_var(--color-gold)]';

export default function StudioSidebar() {
  return (
    <nav aria-label="Studio" className="p-3">
      <ul className="space-y-1">
        <li>
          {/* `end`: Home is the dashboard itself, not every page under it. */}
          <NavLink to="/dashboard" end className={link}>
            Home
          </NavLink>
        </li>
        <li>
          {/* Shares Home's destination (the project list lives there), so it
              is a plain link and Home alone carries the current-page mark. */}
          <Link to="/dashboard" className={link}>
            My Projects
          </Link>
        </li>
        <li>
          <a href="/explore" className={link}>
            Explore
          </a>
        </li>

        <li>
          <NavLink to="/studio/settings" className={link}>
            Settings
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
