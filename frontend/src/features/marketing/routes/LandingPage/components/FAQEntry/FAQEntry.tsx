import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

const answerText = 'max-w-[64ch] text-[17px] leading-relaxed text-muted-dark';

function FAQEntry({
  question,
  answer,
  isAccordion,
}: FAQItem & { isAccordion: boolean }) {
  if (isAccordion) {
    return (
      <Disclosure as="div" className="border-b border-rule-dark">
        {({ open }) => (
          <>
            <dt>
              <DisclosureButton
                as="button"
                className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-[6px] py-5 text-left"
                aria-label={`Toggle answer for: ${question}`}
              >
                <span className="text-lg font-semibold">{question}</span>
                <ChevronDown
                  aria-hidden
                  className={`h-5 w-5 shrink-0 text-muted-dark transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </DisclosureButton>
            </dt>
            <DisclosurePanel as="dd" className={`-mt-1 pb-5 ${answerText}`}>
              {answer}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    );
  }

  return (
    <div className="border-b border-rule-dark py-6">
      <dt className="text-lg font-semibold">{question}</dt>
      <dd className={`mt-2 ${answerText}`}>{answer}</dd>
    </div>
  );
}

export default FAQEntry;
