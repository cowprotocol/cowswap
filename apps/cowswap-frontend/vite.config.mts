/// <reference types="vitest" />
import { lingui } from '@lingui/vite-plugin'
import reactPlugin from '@vitejs/plugin-react'
import stdLibBrowser from 'node-stdlib-browser'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, PluginOption, searchForWorkspaceRoot } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import { ModuleNameWithoutNodePrefix, nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { meta } from 'vite-plugin-meta-tags'

import * as path from 'path'

import { getReactProcessEnv } from '../../tools/getReactProcessEnv'

// eslint-disable-next-line no-restricted-imports
import type { TemplateType } from 'rollup-plugin-visualizer/dist/plugin/template-types'
import { robotsPlugin } from '../../tools/vite-plugins/robotsPlugin'

const allNodeDeps = Object.keys(stdLibBrowser).map((key) => key.replace('node:', '')) as ModuleNameWithoutNodePrefix[]

// Trezor getAccountsAsync() requires crypto and stream (the module is lazy-loaded)
const nodeDepsToInclude = ['crypto', 'stream']

const analyzeBundle = process.env.ANALYZE_BUNDLE === 'true'
const analyzeBundleTemplate: TemplateType = (process.env.ANALYZE_BUNDLE_TEMPLATE as TemplateType) || 'treemap' //  "sunburst" | "treemap" | "network" | "raw-data" | "list";

const normalizePath = (filePath: string) => filePath.split(path.sep).join('/')

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  // TODO:These are the paths that should not be compiled with the React Compiler
  // TODO:because they contain historically unstable Hook trees
  // TODO: Remove this once we have refactored the code to use the new Hooks API
  const reactCompilerDenyList = [
    '/src/common/updaters/',
    '/src/modules/application/containers/App/',
    '/src/modules/trade/',
  ]

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
    // React baseline transformer with targeted compiler opt-in.
    reactPlugin({
      babel(id) {
        const normalizedId = normalizePath(id)

        if (!normalizedId.includes('/src/')) {
          return {}
        }

        const shouldSkipCompiler =
          reactCompilerDenyList.some((deny) => normalizedId.includes(deny)) ||
          (normalizedId.includes('/src/modules/') && normalizedId.includes('/updaters/'))

        if (shouldSkipCompiler) {
          return {}
        }

        return {
          plugins: [
            [
              'babel-plugin-react-compiler',
              {
                compilationMode: 'infer',
                panicThreshold: 'none', // Flip to 'throw' locally/CI to surface new violations
              },
            ],
          ],
        }
      },
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
            if (id.includes('@1inch')) return '@1inch'
            if (id.includes('@safe-global') || id.includes('viem')) return '@safe-global'
            if (id.includes('@sentry')) return '@sentry'
            if (id.includes('@uniswap')) return '@uniswap'
            if (id.includes('crypto-es/lib')) return 'crypto-es'
            if (id.includes('web3/dist')) return 'web3'
            if (id.includes('lottie-react')) return 'lottie-react'
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
