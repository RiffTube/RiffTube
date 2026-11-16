import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAQEntry from './FAQEntry';

describe('<FAQEntry as accordion />', () => {
  const question = 'Test question?';
  const answer = 'Test answer.';
  const ariaLabel = `Toggle answer for: ${question}`;

  it('renders the question as a button with the correct aria-label', () => {
    render(
      <dl>
        <FAQEntry question={question} answer={answer} isAccordion={true} />
      </dl>,
    );
    const btn = screen.getByRole('button', { name: ariaLabel });
    expect(btn).toBeInTheDocument();
  });

  it('does not show the answer initially', () => {
    render(
      <dl>
        <FAQEntry question={question} answer={answer} isAccordion={true} />
      </dl>,
    );
    expect(screen.queryByText(answer)).not.toBeInTheDocument();
  });

  it('shows the answer when the question button is clicked', async () => {
    render(
      <dl>
        <FAQEntry question={question} answer={answer} isAccordion={true} />
      </dl>,
    );
    const user = userEvent.setup();
    const btn = screen.getByRole('button', { name: ariaLabel });
    await user.click(btn);
    expect(screen.getByText(answer)).toBeInTheDocument();
  });

  it('toggles the chevron rotation class on click', async () => {
    render(
      <dl>
        <FAQEntry question={question} answer={answer} isAccordion={true} />
      </dl>,
    );
    const user = userEvent.setup();
    const btn = screen.getByRole('button', { name: ariaLabel });
    const svg = btn.querySelector('svg')!;
    expect(svg).not.toHaveClass('rotate-180');
    await user.click(btn);
    expect(svg).toHaveClass('rotate-180');
  });
});

describe('<FAQEntry as expanded />', () => {
  const question = 'Another question?';
  const answer = 'Another answer.';

  it('renders the question inside a <dt>', () => {
    render(
      <dl>
        <FAQEntry question={question} answer={answer} isAccordion={false} />
      </dl>,
    );
    const term = screen.getByText(question);
    expect(term.tagName).toBe('DT');
  });

  it('renders the answer inside a <dd>', () => {
    render(
      <dl>
        <FAQEntry question={question} answer={answer} isAccordion={false} />
      </dl>,
    );
    const def = screen.getByText(answer);
    expect(def.tagName).toBe('DD');
  });
});
