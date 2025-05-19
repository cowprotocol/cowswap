import { withNx } from '@nx/next'
import { WithNxOptions } from '@nx/next/plugins/with-nx'

const nextConfig: WithNxOptions = {
  reactStrictMode: true,
  swcMinify: true,
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
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/videos/',
            outputPath: 'static/videos/',
            name: '[name].[hash].[ext]',
            esModule: false,
          },
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
      },
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
      {
        source: '/widget/terms-and-conditions',
        destination: '/legal/widget-terms',
        permanent: true,
      },
    ]
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['celebrated-gift-f83e5c9419.media.strapiapp.com'],
  },
  async headers() {
    return [
      // Cache all pages for 60 seconds
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
}

module.exports = withNx(nextConfig)
