import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import HeroTelevision from '../HeroTelevision';

interface HeroSectionProps {
  openSignUp: () => void;
}

const TAGLINE = ['Your voice.', 'Your commentary.', 'Your movie night.'];

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
    <section className="surface-paper bg-paper text-ink">
      <div className="page-grid grid grid-cols-1 items-center gap-y-10 pt-8 pb-12 sm:pt-12 lg:grid-cols-[48fr_52fr] lg:gap-x-8 lg:pt-6 lg:pb-14">
        <div>
          <h1 className="text-[clamp(28px,9vw,34px)] leading-[1.09] font-bold tracking-[-0.02em] sm:text-5xl sm:leading-[1.05] lg:text-[46px] xl:text-[60px] xl:leading-[62px]">
            {TAGLINE.map(line => (
              <span key={line} className="block sm:whitespace-nowrap">
                {line}
              </span>
            ))}
          </h1>

          <Button onClick={handleCta} size="lg" className="mt-6">
            Start Riffing
          </Button>
        </div>

        <HeroTelevision className="mx-auto w-[min(72%,260px)] sm:w-[300px] lg:w-[min(100%,372px)] xl:w-[392px]" />
      </div>
    </section>
  );
}

export default HeroSection;
