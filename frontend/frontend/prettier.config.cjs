/** @type {import('prettier').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'auto',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  tailwindStylesheet: './src/index.css',
  // import-sorting plugin
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  importOrder: ['^react$', '^@?\\w', '^@/.*', '^[./]'],
};
