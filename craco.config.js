/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const { version } = require('./package.json')

// see https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration-overview

const plugins = []
const SENTRY_AUTH_TOKEN = process.env.REACT_APP_SENTRY_AUTH_TOKEN
const SENTRY_RELEASE_VERSION = 'CowSwap@v' + version

if (SENTRY_AUTH_TOKEN) {
  plugins.push(
    new SentryWebpackPlugin({
      // sentry-cli configuration - can also be done directly through sentry-cli
      // see https://docs.sentry.io/product/cli/configuration/ for details
      authToken: SENTRY_AUTH_TOKEN,
      org: 'gnosis-protocol',
      project: 'cowswap',
      release: SENTRY_RELEASE_VERSION,

      // other SentryWebpackPlugin configuration
      include: '.',
      ignore: ['node_modules', 'webpack.config.js'],
    })
  )
}

module.exports = function () {
  return {
    babel: {
      plugins: ['@babel/plugin-proposal-nullish-coalescing-operator'],
    },
    webpack: {
      plugins,
      alias: {
        '@src': path.resolve(__dirname, 'src'),
      },
      // https://webpack.js.org/configuration
      configure: (webpackConfig) => ({
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          modules: [path.resolve(__dirname, 'src/custom'), ...webpackConfig.resolve.modules],
        },
      }),
    },
  }
}
