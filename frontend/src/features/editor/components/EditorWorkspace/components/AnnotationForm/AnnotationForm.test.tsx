import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { makeRiff } from '@/testUtils/server';
import AnnotationForm from './AnnotationForm';

function renderForm(
  riff = makeRiff({ text: 'Wait for it...' }),
  disabled = false,
) {
  const onChange = vi.fn();
  render(
    <AnnotationForm riff={riff} onChange={onChange} disabled={disabled} />,
  );
  return { onChange, user: userEvent.setup() };
}

describe('<AnnotationForm />', () => {
  it('shows the riff text and the default look when no styling is set', () => {
    renderForm();

    expect(screen.getByLabelText(/riff text/i)).toHaveValue('Wait for it...');
    expect(screen.getByLabelText(/background/i)).toHaveValue('#000000');
    expect(screen.getByLabelText(/text color/i)).toHaveValue('#ffffff');
    expect(screen.getByLabelText(/font size/i)).toHaveValue('16');
  });

  it('shows the styling the riff already has', () => {
    renderForm(
      makeRiff({
        styling: { bgColor: '#112233', textColor: '#ffcc00', fontSize: 24 },
      }),
    );

    expect(screen.getByLabelText(/background/i)).toHaveValue('#112233');
    expect(screen.getByLabelText(/text color/i)).toHaveValue('#ffcc00');
    expect(screen.getByLabelText(/font size/i)).toHaveValue('24');
  });

  it('reports a text edit on the keystroke itself', async () => {
    const { onChange, user } = renderForm();

    await user.type(screen.getByLabelText(/riff text/i), '!');

    expect(onChange).toHaveBeenCalledWith({ text: 'Wait for it...!' });
  });

  it('reports style edits merged into the existing styling', async () => {
    const { onChange, user } = renderForm(
      makeRiff({ styling: { textColor: '#ffcc00', somethingElse: true } }),
    );

    fireEvent.change(screen.getByLabelText(/background/i), {
      target: { value: '#112233' },
    });
    await user.selectOptions(screen.getByLabelText(/font size/i), '24');

    expect(onChange).toHaveBeenNthCalledWith(1, {
      styling: {
        textColor: '#ffcc00',
        somethingElse: true,
        bgColor: '#112233',
      },
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      styling: { textColor: '#ffcc00', somethingElse: true, fontSize: 24 },
    });
  });

  it('locks every field when disabled', async () => {
    const { onChange, user } = renderForm(undefined, true);

    for (const label of [
      /riff text/i,
      /background/i,
      /text color/i,
      /font size/i,
    ])
      expect(screen.getByLabelText(label)).toBeDisabled();

    await user.type(screen.getByLabelText(/riff text/i), '!');
    expect(onChange).not.toHaveBeenCalled();
  });
});
