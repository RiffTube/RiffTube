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

function FAQEntry({
  question,
  answer,
  isAccordion,
}: FAQItem & { isAccordion: boolean }) {
  if (isAccordion) {
    return (
      <Disclosure>
        {({ open }) => (
          <>
            <dt>
              <DisclosureButton
                as="button"
                className="flex w-full items-center justify-between rounded-lg bg-vintage-teal-dark p-6 text-left"
                aria-label={`Toggle answer for: ${question}`}
              >
                <span className="text-lg font-semibold">{question}</span>
                <ChevronDown
                  aria-hidden
                  className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </DisclosureButton>
            </dt>
            <DisclosurePanel
              as="dd"
              className="mt-2 px-6 pb-4 text-base leading-relaxed text-gray-200"
            >
              {answer}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    );
  }

  return (
    <div>
      <dt className="text-lg font-semibold">{question}</dt>
      <dd className="mt-2 text-base leading-relaxed text-gray-200">{answer}</dd>
    </div>
  );
}

export default FAQEntry;
