/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const webpack = require('webpack')
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CracoWorkboxPlugin = require('craco-workbox')
const StaticSourceData = require('static-source-data')
const { version } = require('./package.json')

// see https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration-overview

const plugins = [
  new StaticSourceData({
    test: {
      url: 'http://localhost:1337/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer d59b2b0854dacb0441724234a1730770101a6508e9098366a59ce850e2be104d30a0a73b5e740408715fa24af6b75d3127c7bc0a61df171cb7b4b96914e88943f30553f1fd5e16cc55e5ec41066a7c8b0efa9c683ceb35a079aca44e13c3f07166563aad31aa9d88e7c85c52ec3ae3a5009b6b2a82441316c6ac37a6bbd23b27',
      },
      body: JSON.stringify({
        query: `
          query {
            faqs {
              data {
                attributes {
                  categories {
                    data {
                      attributes {
                        Title
                        Questions {
                          data {
                            attributes {
                              Title
                              Answer
                            }
                          }
                        }
                        Footer
                      }
                    }
                  }
                }
              }
            }
          }
        `,
      }),
    },
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
]
const SENTRY_AUTH_TOKEN = process.env.REACT_APP_SENTRY_AUTH_TOKEN
const SENTRY_RELEASE_VERSION = 'CowSwap@v' + version
const ANALYZE_BUNDLE = process.env.REACT_APP_ANALYZE_BUNDLE

if (ANALYZE_BUNDLE) {
  plugins.push(new BundleAnalyzerPlugin())
}

if (SENTRY_AUTH_TOKEN) {
  plugins.push(
    new SentryWebpackPlugin({
      // sentry-cli configuration - can also be done directly through sentry-cli
      // see https://docs.sentry.io/product/cli/configuration/ for details
      authToken: SENTRY_AUTH_TOKEN,
      org: 'cowprotocol',
      project: 'cowswap',
      release: SENTRY_RELEASE_VERSION,

      // other SentryWebpackPlugin configuration
      include: '.',
      ignore: ['node_modules', 'webpack.config.js'],
    })
  )
}

module.exports = {
  plugins: [
    {
      plugin: CracoWorkboxPlugin,
    },
  ],
  babel: {
    plugins: [
      '@babel/plugin-proposal-nullish-coalescing-operator',
      [
        '@simbathesailor/babel-plugin-use-what-changed',
        {
          active: process.env.NODE_ENV === 'development', // boolean
        },
      ],
    ],
  },
  webpack: {
    plugins,
    alias: {
      '@cow': path.resolve(__dirname, 'src/cow-react'),
      '@src': path.resolve(__dirname, 'src'),
      'bn.js': path.resolve(__dirname, 'node_modules/bn.js/lib/bn.js'),
    },
    // https://webpack.js.org/configuration
    configure: (webpackConfig) => ({
      ...webpackConfig,
      // https://github.com/facebook/create-react-app/discussions/11767#discussioncomment-2421668
      ignoreWarnings: [
        (warning) => {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          )
        },
      ],
      resolve: {
        ...webpackConfig.resolve,
        /**
         * BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
         */
        fallback: {
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          crypto: require.resolve('crypto-browserify'),
        },
      },
    }),
  },
  devServer: (config) => {
    // Add CORS headers, to enable to add the local served website in Gnosis Safe
    config.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    }

    return config
  },
}
