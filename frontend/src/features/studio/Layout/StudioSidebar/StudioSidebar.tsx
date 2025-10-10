import { NavLink } from 'react-router-dom';

const link =
  'block rounded-lg px-3 py-2 text-sm hover:bg-white/5 aria-[current=page]:bg-white/10 aria-[current=page]:font-semibold';

export default function StudioSidebar() {
  return (
    <nav className="p-3">
      <ul className="space-y-1">
        <li>
          <NavLink to="/dashboard" className={link}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/studio/projects" className={link}>
            My Projects
          </NavLink>
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
