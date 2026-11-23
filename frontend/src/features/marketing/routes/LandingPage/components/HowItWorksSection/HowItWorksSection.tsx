import { Mic, Share2 } from 'lucide-react';
import TvIcon from '@/assets/rifftube-logo.svg?react';
import Card from '../Card';

/*
 * The step icons share one optical weight: the mic and share glyphs are drawn
 * with strokes that match the frame of the RiffTube TV beside them.
 */
const StepTvIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <TvIcon fill="currentColor" stroke="none" {...props} />
);
const StepMicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <Mic strokeWidth={2.4} {...props} />
);
const StepShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <Share2 strokeWidth={2.4} {...props} />
);

const steps = [
  {
    number: 1,
    title: 'Pick Your Video',
    Icon: StepTvIcon,
    description: 'Find any YouTube video that deserves your genius',
  },
  {
    number: 2,
    title: 'Add Your Riffs',
    Icon: StepMicIcon,
    description: 'Record your voice or add subtitles',
  },
  {
    number: 3,
    title: 'Share the Fun',
    Icon: StepShareIcon,
    description:
      'Send your riffed creation to friends—or broadcast it to the world.',
  },
];

function HowItWorksSection() {
  return (
    <section className="surface-paper bg-paper text-ink">
      <div className="page-grid pb-16 sm:pb-20">
        <div className="border-t border-ink pt-10 sm:pt-12">
          <h2 className="font-serif text-[32px] leading-tight md:text-[38px]">
            How It Works
          </h2>

          <ol className="mt-8 grid grid-cols-1 border-y border-rule-light md:grid-cols-3">
            {steps.map(step => (
              <li
                key={step.number}
                className="border-rule-light py-6 not-first:border-t md:px-6 md:py-7 md:not-first:border-t-0 md:not-first:border-l md:first:pl-0 md:last:pr-0"
              >
                <Card number={step.number} title={step.title} Icon={step.Icon}>
                  {step.description}
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
export default HowItWorksSection;
