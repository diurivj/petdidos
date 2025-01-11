/** @type {import("prettier").Options} */
export const config = {
  arrowParens: 'avoid',
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  jsxSingleQuote: true,
  printWidth: 80,
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  requirePragma: false,
  semi: false,
  singleAttributePerLine: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
  overrides: [
    // formatting the package.json with anything other than spaces will cause
    // issues when running install...
    {
      files: ['**/package.json'],
      options: {
        useTabs: false
      }
    },
    {
      files: ['**/*.mdx'],
      options: {
        // This stinks, if you don't do this, then an inline component on the
        // end of the line will end up wrapping, then the next save prettier
        // will add an extra line break. Super annoying and probably a bug in
        // prettier, but until it's fixed, this is the best we can do.
        proseWrap: 'preserve',
        htmlWhitespaceSensitivity: 'ignore'
      }
    }
  ],
  plugins: ['prettier-plugin-tailwindcss']
}

// this is for backward compatibility
export default config
