import { withNx } from '@nx/next'
import { WithNxOptions } from '@nx/next/plugins/with-nx'
import { NextConfig } from 'next'

const nextConfig: WithNxOptions & NextConfig = {
  reactStrictMode: true,
  nx: {},
  eslint: {
    ignoreDuringBuilds: true,
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
        destination: '/legal/integrator-terms',
        permanent: true,
      },
      {
        source: '/legal/widget-terms',
        destination: '/legal/integrator-terms',
        permanent: true,
      },
      {
        source: '/mevblocker',
        destination: '/mev-blocker',
        permanent: true,
      },
    ]
  },

  images: {
    domains: ['celebrated-gift-f83e5c9419.media.strapiapp.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/learn/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400', // 1h cache, 24h stale
          },
        ],
      },
      // Cache all other pages for 1 hour
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400', // 1h cache, 24h stale
          },
        ],
      },
    ]
  },
}

module.exports = withNx(nextConfig)
