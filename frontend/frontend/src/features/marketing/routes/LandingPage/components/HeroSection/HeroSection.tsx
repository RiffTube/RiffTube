import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface HeroSectionProps {
  openSignUp: () => void;
}

function HeroSection({ openSignUp }: HeroSectionProps) {
  const { state } = useAuth();
  const navigate = useNavigate();

  const handleCta = () => {
    if (state === 'authorized') {
      navigate('/dashboard');
    } else {
      openSignUp();
    }
  };

  return (
    <section className="overflow-hidden bg-backstage text-white">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8 sm:max-w-xl sm:py-12 md:max-w-screen-2xl lg:py-20">
        <div className="rounded-2xl bg-flicker-white p-4 text-black shadow-2xl sm:p-8">
          <Logo />
          <p className="mt-3 mb-4 space-y-0.5 text-center text-lg leading-snug sm:mb-6 sm:text-xl md:text-left md:text-2xl">
            <span className="block">Your voice.</span>
            <span className="block">Your commentary.</span>
            <span className="block">Your movie night.</span>
          </p>

          <div className="flex justify-center md:justify-start">
            <Button onClick={handleCta} size="lg">
              Start Riffing
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-b-2xl shadow-2xl">
          <div className="h-32 bg-[url('/theater.png')] bg-cover bg-center sm:h-40 md:h-48 lg:h-64" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
