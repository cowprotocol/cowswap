/// <reference types="vitest" />
import { lingui } from '@lingui/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import stdLibBrowser from 'node-stdlib-browser'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import { meta } from 'vite-plugin-meta-tags'
import { ModuleNameWithoutNodePrefix, nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import * as path from 'path'

import { getReactProcessEnv } from '../../tools/getReactProcessEnv'
import { robotsPlugin } from '../../tools/vite-plugins/robotsPlugin'

// eslint-disable-next-line no-restricted-imports
import type { TemplateType } from 'rollup-plugin-visualizer/dist/plugin/template-types'
import type { PluginOption } from 'vite'

const allNodeDeps = Object.keys(stdLibBrowser).map((key) => key.replace('node:', '')) as ModuleNameWithoutNodePrefix[]

// Trezor getAccountsAsync() requires crypto and stream (the module is lazy-loaded)
const nodeDepsToInclude = ['crypto', 'stream']

const analyzeBundle = process.env.ANALYZE_BUNDLE === 'true'
const analyzeBundleTemplate: TemplateType = (process.env.ANALYZE_BUNDLE_TEMPLATE as TemplateType) || 'treemap' //  "sunburst" | "treemap" | "network" | "raw-data" | "list";

// eslint-disable-next-line max-lines-per-function
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  const plugins: PluginOption[] = [
    nodePolyfills({
      exclude: allNodeDeps.filter((dep) => !nodeDepsToInclude.includes(dep)),
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    react({
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    viteTsConfigPaths({
      root: '../../',
    }),
    macrosPlugin(),
    lingui({
      cwd: 'apps/cowswap-frontend',
    }),
    svgr(),
    VitePWA({
      injectRegister: null,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      minify: true,
      injectManifest: {
        maximumFileSizeToCacheInBytes: 7000000, // 7mb
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,json,woff,woff2,md}'],
      },
    }),
    robotsPlugin({
      robotsDir: 'robots',
      publicPath: path.resolve(__dirname, './public'),
    }),
  ]

  if (analyzeBundle) {
    plugins.push(
      visualizer({
        template: analyzeBundleTemplate,
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'analyse.html', // will be saved in project's root
      }) as PluginOption,
    )
  }

  // Disable page indexing for non-prod envs
  if (!isProduction) {
    plugins.push(
      meta({}, undefined, [
        {
          tag: 'meta',
          injectTo: 'head-prepend',
          attrs: { name: 'robots', content: 'noindex,nofollow' },
        },
      ]),
    )
  }

  return {
    root: path.resolve(__dirname, './'),
    base: './',
    define: {
      ...getReactProcessEnv(mode),
    },

    assetsInclude: ['**/*.md'],

    cacheDir: '../../node_modules/.vite/cowswap-frontend',

    server: {
      port: 3000,
      host: 'localhost',
      fs: {
        allow: [
          // search up for workspace root
          searchForWorkspaceRoot(process.cwd()),
          // your custom rules
          'apps/cowswap-frontend/src',
          'libs',
        ],
      },
      proxy: {
        '/hook-dapp-omnibridge': {
          target: 'http://localhost:4317',
          changeOrigin: true,
        },
      },
    },

    preview: {
      port: 3000,
      host: 'localhost',
    },

    resolve: {
      alias: {
        'node-fetch': 'isomorphic-fetch',
      },
      dedupe: [
        'bn.js', // 240kb -> 16kb (gzip) // v5 is compatible with v4
      ],
    },

    build: {
      assetsInlineLimit: 0, // prevent inlining assets
      assetsDir: 'static', // All assets go to /static/ directory
      // sourcemap: true, // disabled for now, as this is causing vercel builds to fail
      rollupOptions: {
        output: {
          // Remove hash for font files to enable preloading
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && (/StudioFeixen/i.test(assetInfo.name) || /Inter-/i.test(assetInfo.name))) {
              return 'static/[name][extname]' // Fonts without hash
            }
            return 'static/[name]-[hash][extname]' // Everything else with hash
          },
          manualChunks(id) {
            if (id.includes('@safe-global') || id.includes('viem')) return '@safe-global'
            if (id.includes('@sentry')) return '@sentry'
            if (id.includes('@uniswap')) return '@uniswap'
            if (id.includes('crypto-es/lib')) return 'crypto-es'
            if (id.includes('web3/dist')) return 'web3' // was used by @1inch
            if (id.includes('lottie-react')) return 'lottie-react'
            if (id.includes('bn.js')) return 'bn'
          },
        },
      },
    },

    plugins,

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [
    //    viteTsConfigPaths({
    //      root: '../../',
    //    }),
    //  ],
    // },
  }
})
