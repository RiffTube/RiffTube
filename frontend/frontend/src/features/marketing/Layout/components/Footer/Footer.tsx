import FacebookIcon from '@/assets/facebook.svg?react';
import TVIcon from '@/assets/rifftube-logo.svg?react';
import TwitterIcon from '@/assets/twitter.svg?react';
import YouTubeIcon from '@/assets/youtube.svg?react';

function Footer() {
  return (
    <footer className="bg-backstage py-8">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4">
        <div className="flex space-x-6">
          <a
            href="https://facebook.com"
            aria-label="Facebook"
            className="text-white hover:text-primary"
          >
            <FacebookIcon className="h-6 w-6 fill-none stroke-current stroke-2 text-white" />
          </a>
          <a
            href="https://twitter.com"
            aria-label="Twitter"
            className="text-white hover:text-primary"
          >
            <TwitterIcon className="h-6 w-6 fill-none stroke-current stroke-2 text-white" />
          </a>
          <a
            href="https://youtube.com"
            aria-label="YouTube"
            className="text-white hover:text-primary"
          >
            <YouTubeIcon className="h-6 w-6 fill-none stroke-current stroke-2 text-white" />
          </a>
        </div>
        <div className="flex items-baseline gap-2">
          <TVIcon
            className="h-6 w-auto fill-current text-white sm:h-8"
            aria-hidden="true"
          />
          <span className="font-['Limelight',cursive] text-lg text-white sm:text-xl">
            RiffTube
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
