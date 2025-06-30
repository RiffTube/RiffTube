import { Link } from 'react-router-dom';
import TvIcon from '@/assets/rifftube-logo.svg?react';

function HeroSection() {
  return (
    <section className="overflow-hidden bg-backstage text-white">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8 sm:max-w-xl sm:py-12 md:max-w-screen-2xl lg:py-20">
        <div className="rounded-2xl bg-flicker-white p-4 text-black shadow-2xl sm:p-8">
          {/* Logo + Wordmark */}
          <div className="flex items-baseline justify-center gap-2 sm:gap-4 md:justify-start">
            <TvIcon
              className="-mt-px h-8 w-auto sm:h-10 md:h-14 lg:h-20"
              aria-hidden="true"
            />
            <h1 className="font-['Limelight',cursive] text-2xl leading-none sm:text-3xl md:text-4xl lg:text-5xl">
              RiffTube
            </h1>
          </div>

          {/* Tagline */}
          <p className="mt-3 mb-4 space-y-0.5 text-center text-lg leading-snug sm:mb-6 sm:text-xl md:text-left md:text-2xl">
            <span className="block">Your voice.</span>
            <span className="block">Your commentary.</span>
            <span className="block">Your movie night.</span>
          </p>

          {/* CTA */}
          <div className="flex justify-center md:justify-start">
            <Link
              to="/signup"
              className="rounded-md bg-primary px-4 py-2 text-base font-semibold text-white transition hover:bg-primary-dark sm:px-6 sm:py-3 sm:text-lg"
            >
              Start Riffing
            </Link>
          </div>
        </div>

        {/* Cinema Seats Strip */}
        <div className="relative overflow-hidden rounded-b-2xl shadow-2xl">
          <div className="h-32 bg-[url('/theater.png')] bg-cover bg-center sm:h-40 md:h-48 lg:h-64" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
