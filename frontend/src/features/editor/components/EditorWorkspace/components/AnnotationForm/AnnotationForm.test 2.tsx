import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { makeRiff } from '@/testUtils/server';
import AnnotationForm from './AnnotationForm';

const riff = makeRiff({ text: 'Wait for it...', start: 5, end: 9 });

function renderForm() {
  const onChange = vi.fn();
  const onTouched = vi.fn();
  render(
    <AnnotationForm riff={riff} onChange={onChange} onTouched={onTouched} />,
  );
  return { onChange, onTouched, user: userEvent.setup({ delay: null }) };
}

describe('<AnnotationForm />', () => {
  it('reports a touch on the first keystroke, ahead of the debounced change', async () => {
    const { onChange, onTouched, user } = renderForm();

    await user.type(screen.getByPlaceholderText(/type riff text/i), '!');

    expect(onTouched).toHaveBeenCalled();
    // Still inside the 300ms window, so the draft has not been updated yet.
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports the text edit once the debounce expires', async () => {
    const { onChange, user } = renderForm();

    await user.type(screen.getByPlaceholderText(/type riff text/i), '!');

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({ text: 'Wait for it...!' }),
    );
  });

  it('reports a touch and then a new end time when the duration changes', async () => {
    const { onChange, onTouched } = renderForm();

    // The input rejects intermediate empty values, so set it in one go.
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '6' },
    });

    expect(onTouched).toHaveBeenCalled();
    await waitFor(() => expect(onChange).toHaveBeenCalledWith({ end: 11 }));
  });

  it('stays quiet when nothing is edited', async () => {
    const { onChange, onTouched } = renderForm();

    await new Promise(resolve => setTimeout(resolve, 400));

    expect(onTouched).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
