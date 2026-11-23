import FacebookIcon from '@/assets/facebook.svg?react';
import TVIcon from '@/assets/rifftube-logo.svg?react';
import TwitterIcon from '@/assets/twitter.svg?react';
import YouTubeIcon from '@/assets/youtube.svg?react';

const SOCIAL_LINKS = [
  { href: 'https://facebook.com', label: 'Facebook', Icon: FacebookIcon },
  { href: 'https://twitter.com', label: 'Twitter', Icon: TwitterIcon },
  { href: 'https://youtube.com', label: 'YouTube', Icon: YouTubeIcon },
];

function Footer() {
  return (
    <footer className="border-t border-rule-dark bg-ink text-paper">
      <div className="page-grid flex items-center justify-between py-6">
        {/* 44px hit areas; -ml-2.5 keeps the first icon on the grid edge. */}
        <ul className="-ml-2.5 flex gap-1">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] text-paper transition-colors hover:text-gold"
              >
                <Icon
                  aria-hidden="true"
                  className="h-6 w-6 fill-none stroke-current stroke-2"
                />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2">
          <TVIcon className="h-6 w-auto fill-current" aria-hidden="true" />
          <span className="font-serif text-xl leading-none">RiffTube</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
