import FAQEntry from '../FAQEntry';

const faqs = [
  {
    question: 'Do I need a YouTube account to use RiffTube?',
    answer:
      'Nope! Any public YouTube link works. Paste it in and start riffing.',
  },
  {
    question: 'Can I keep my riffs private?',
    answer:
      'Absolutely. Projects can be public, unlisted, or private—your call.',
  },
  {
    question: 'Can I invite friends to riff with me?',
    answer:
      'Collaborative riffing is on our roadmap. For now each riff is solo, but you can share a link to your finished riff.',
  },
  {
    question: 'Do I need to install anything?',
    answer: 'No installs. RiffTube lives entirely in your browser.',
  },
  {
    question: 'What happens if the video is removed from YouTube?',
    answer:
      "Your riff stays safe, but playback won't work. Just attach the riff to a different video anytime.",
  },
];

function FAQSection() {
  return (
    <section className="bg-vintage-teal py-20 text-white">
      <div className="container mx-auto max-w-screen-2xl px-4">
        <h2 className="mb-10 text-center font-['Limelight',cursive] text-4xl md:text-6xl">
          FAQ
        </h2>

        <dl className="space-y-6 lg:hidden">
          {faqs.map(faqItem => (
            <FAQEntry key={faqItem.question} {...faqItem} isAccordion />
          ))}
        </dl>

        <dl className="hidden space-y-8 lg:block">
          {faqs.map(faqItem => (
            <FAQEntry key={faqItem.question} {...faqItem} isAccordion={false} />
          ))}
        </dl>
      </div>
    </section>
  );
}

export default FAQSection;
