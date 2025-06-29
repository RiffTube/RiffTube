import '../src/index.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  Story => (
    <div className="flex min-h-screen items-center justify-center bg-[#133334] p-8">
      <div className="w-full max-w-md rounded-2xl bg-[#1A1A1A] p-8">
        <Story />
      </div>
    </div>
  ),
];
