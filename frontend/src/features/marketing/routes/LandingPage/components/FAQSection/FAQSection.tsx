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
    <section className="bg-charcoal text-paper">
      <div className="page-grid grid grid-cols-1 gap-y-8 py-16 sm:py-20 lg:grid-cols-[4fr_8fr] lg:gap-x-8">
        <h2 className="font-serif text-[32px] leading-tight md:text-[38px]">
          FAQ
        </h2>

        <dl className="border-t border-rule-dark lg:hidden">
          {faqs.map(faqItem => (
            <FAQEntry key={faqItem.question} {...faqItem} isAccordion />
          ))}
        </dl>

        <dl className="hidden border-t border-rule-dark lg:block">
          {faqs.map(faqItem => (
            <FAQEntry key={faqItem.question} {...faqItem} isAccordion={false} />
          ))}
        </dl>
      </div>
    </section>
  );
}

export default FAQSection;
