/** @type {import('prettier').Config} */
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
  tailwindStylesheet: './frontend/src/index.css',
  // import-sorting plugin
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  importOrder: ['^react$', '^@?\\w', '^@/.*', '^[./]'],
};
