// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

// see https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration-overview

module.exports = function () {
  return {
    babel: {
      plugins: ['@babel/plugin-proposal-nullish-coalescing-operator'],
    },
    webpack: {
      alias: {
        '@src': path.resolve(__dirname, 'src'),
      },
      plugins: [],

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
