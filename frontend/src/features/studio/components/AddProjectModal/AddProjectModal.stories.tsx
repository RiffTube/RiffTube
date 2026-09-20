import { useState } from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import AddProjectModal, { AddProjectModalProps } from './AddProjectModal';

const meta: Meta<typeof AddProjectModal> = {
  title: 'Studio/AddProjectModal',
  component: AddProjectModal,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        http.post('/api/v1/projects', async () =>
          HttpResponse.json({
            project: {
              id: 'demo-project-id',
              title: 'Guitar Solo Breakdown',
              videoHost: 'youtube',
              videoId: 'dQw4w9WgXcQ',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              visibility: 'private',
            },
          }),
        ),
      ],
    },
  },
};
export default meta;

type Story = StoryObj<typeof AddProjectModal>;

function StatefulWrapper(args: AddProjectModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(args.isOpen ?? false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ marginBottom: 16, padding: '8px 12px' }}
      >
        Open Add Project Modal
      </button>
      <AddProjectModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreated={args.onCreated ?? action('onCreated')}
      />
    </>
  );
}

export const Default: Story = {
  render: args => <StatefulWrapper {...args} />,
  args: { isOpen: true },
};

export const PrefilledFromLink: Story = {
  render: args => <StatefulWrapper {...args} />,
  args: {
    isOpen: true,
    initialYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
};
