import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CTAButton from '../CTAButton';
import Modal from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  argTypes: {
    isOpen: { control: 'boolean' },
    className: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Thin styling wrapper around Headless UI's `<Dialog>`.\n" +
          'Provides consistent padding, rounded corners, dark theme, and enter/exit transitions.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Playground: Story = {
  args: { isOpen: true, className: 'bg-yellow-500' },
  render: args => (
    <Modal {...args} onClose={() => {}}>
      <h1 className="mb-4 text-2xl font-bold">Hello from RiffTube!</h1>
      <p className="mb-8">
        Use the **Controls** panel to toggle <code>isOpen</code> or adjust the
        custom
        <code>className</code>.
      </p>
      <CTAButton onClick={() => alert('Action!')}>Take Action</CTAButton>
    </Modal>
  ),
};

export const Toggled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <CTAButton onClick={() => setOpen(true)}>Open modal</CTAButton>

        <Modal isOpen={open} onClose={() => setOpen(false)}>
          <h2 className="mb-2 text-xl font-semibold">Toggle example</h2>
          <p className="mb-6 text-sm">
            Demonstrates mounting/unmounting and focus trapping via Headless UI.
          </p>
          <CTAButton onClick={() => setOpen(false)}>Close</CTAButton>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Illustrates a common pattern: keep the “open” state in the parent and ' +
          'pass it to `Modal` along with an `onClose` handler.',
      },
    },
  },
};
