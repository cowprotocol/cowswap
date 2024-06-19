const { composePlugins, withNx } = require('@nx/next')

const nextConfig = {
  nx: {
    svgr: false,
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      }
    }

    config.module.rules.push(
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/fonts/[hash][ext][query]',
        },
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/images/[hash][ext][query]',
        },
      },
      {
        test: /\.[tj]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['next/babel'],
              plugins: ['babel-plugin-macros'],
            },
          },
        ],
      }
    )

    return config
  },
  async redirects() {
    return [
      {
        source: '/learn/articles/1',
        destination: '/learn/articles',
        permanent: true,
      },
      {
        source: '/jobs',
        destination: '/careers',
        permanent: true,
      },
      {
        source: '/report-scam',
        destination: 'https://app.chainpatrol.io/cow',
        permanent: true,
      },
    ]
  },
}

const plugins = [withNx]

module.exports = composePlugins(...plugins)(nextConfig)
