const withTM = require('next-transpile-modules')(['react-syntax-highlighter']); // pass the modules you would like to see transpiled

module.exports = withTM({
  i18n: {
    locales: ['en', 'es', 'pseudo'],
    defaultLocale: 'en',
  },
  experimental: {
    // Enables the styled-components SWC transform
    styledComponents: true
  }
});
