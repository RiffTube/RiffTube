import MicIcon from '@/assets/microphone.svg?react';
import TvIcon from '@/assets/rifftube-logo.svg?react';
import ShareIcon from '@/assets/share-icon.svg?react';
import Card from '../Card';

function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: 'Pick Your Video',
      Icon: TvIcon,
      description: 'Find any YouTube video that deserves your genius',
    },
    {
      number: 2,
      title: 'Add Your Riffs',
      Icon: MicIcon,
      description: 'Record your voice or add subtitles',
    },
    {
      number: 3,
      title: 'Share the Fun',
      Icon: ShareIcon,
      description:
        'Send your riffed creation to friends—or broadcast it to the world.',
    },
  ];

  return (
    <section className="bg-popcorn-butter py-16 text-black">
      <div className="container mx-auto max-w-screen-2xl px-4 py-4">
        <h2 className="mb-12 text-center font-['Limelight',cursive] text-4xl font-bold md:text-6xl">
          How It Works
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {steps.map(step => (
            <Card
              key={step.number}
              number={step.number}
              title={step.title}
              Icon={step.Icon}
            >
              {step.description}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
export default HowItWorksSection;
