/// <reference types="vitest" />
import { lingui } from '@lingui/vite-plugin'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import { bundleStats } from 'rollup-plugin-bundle-stats'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import { meta } from 'vite-plugin-meta-tags'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import { execSync } from 'child_process'
import * as path from 'path'

import pkg from './package.json'

import { formatChunkFileName } from '../../tools/formatChunkFileName'
import { getReactProcessEnv } from '../../tools/getReactProcessEnv'
import { NODE_STD_LIBS } from '../../tools/nodeStdLibs'
import { robotsPlugin } from '../../tools/vite-plugins/robotsPlugin'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import type { TemplateType } from 'rollup-plugin-visualizer/dist/plugin/template-types'
import type { PluginOption } from 'vite'

// Trezor getAccountsAsync() requires crypto and stream (the module is lazy-loaded)
const nodeDepsToInclude = ['crypto', 'stream']

const analyzeBundle = process.env.ANALYZE_BUNDLE === 'true'
const analyzeBundleTemplate: TemplateType = (process.env.ANALYZE_BUNDLE_TEMPLATE as TemplateType) || 'treemap' //  "sunburst" | "treemap" | "network" | "raw-data" | "list";
const defaultSentryOrg = 'cowprotocol'
const defaultSentryProject = 'cowswap'
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN
const sentryOrg = process.env.SENTRY_ORG || defaultSentryOrg
const sentryProject = process.env.SENTRY_PROJECT || defaultSentryProject
const sentryReleaseName = `CowSwap@v${pkg.version}`

// eslint-disable-next-line max-lines-per-function
export default defineConfig(({ mode, isPreview }) => {
  const isProduction = mode === 'production'

  const plugins: PluginOption[] = [
    nodePolyfills({
      exclude: NODE_STD_LIBS.filter((dep) => !nodeDepsToInclude.includes(dep)),
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    react(),
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
        // Preview build currently emits a large main chunk.
        // If this value is smaller, pnpm preview will fail to start and Cypress will hang in CI and eventually timeout.
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MiB
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
        emitFile: true,
        filename: 'analyse.html', // will be saved in build/cowswap/analyse.html
      }) as PluginOption,
    )
    plugins.push(bundleStats() as PluginOption)
  }

  if (isProduction && sentryAuthToken) {
    plugins.push(
      ...sentryVitePlugin({
        org: sentryOrg,
        project: sentryProject,
        authToken: sentryAuthToken,
        telemetry: false,
        release: {
          name: sentryReleaseName,
          inject: false,
          create: true,
          finalize: true,
        },
        sourcemaps: {
          // Use absolute globs so cleanup works both in Nx builds from the repo root
          // and direct Vite builds from the app directory.
          filesToDeleteAfterUpload: [
            path.resolve(__dirname, '../../build/cowswap/**/*.map'),
            path.resolve(__dirname, './dist/**/*.map'),
          ],
        },
      }),
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
      'process.env.REACT_APP_GIT_COMMIT_HASH': JSON.stringify(
        execSync('git rev-parse --short=7 HEAD').toString().trim(),
      ),
      'process.env.REACT_APP_GIT_COMMIT_DATE': JSON.stringify(
        execSync('git show -s --format=%cI HEAD').toString().trim(),
      ),
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

    optimizeDeps: {
      esbuildOptions: {
        // force esm usage for misconfigured deps' package.json (e.g. @safe-global/safe-apps-sdk)
        mainFields: ['exports', 'module', 'main'],
        plugins: [
          {
            // During pre-bundling, esbuild walks @base-org/account internals using relative
            // paths, so the top-level resolve.alias entry isn't enough. This plugin rewrites
            // any resolution that lands on getInjectedProvider.js to our local shim.
            // See: src/shims/baseAccountGetInjectedProvider.ts
            name: 'cow-base-account-getInjectedProvider-shim',
            setup(build) {
              const shim = path.resolve(__dirname, 'src/shims/baseAccountGetInjectedProvider.ts')
              build.onResolve({ filter: /(^|[\\/])getInjectedProvider(\.js)?$/ }, (args) => {
                if (args.importer.includes('@base-org/account')) {
                  return { path: shim }
                }
                return null
              })
            },
          },
        ],
      },
      // Only include packages that are direct or resolvable from the app; transitive
      // WalletConnect deps (universal-provider, utils, sign-client) are not resolvable here.
      include: ['@walletconnect/ethereum-provider'],
    },

    resolve: {
      alias: {
        'node-fetch': 'isomorphic-fetch',
        // @base-org/account@2.4.0 (pinned exactly by @reown/appkit-utils@1.8.19) reads
        // `window.top?.ethereum` without try/catch, which throws SecurityError when the
        // widget is loaded in a cross-origin iframe (e.g. widget-configurator) and aborts
        // the Base Account connector's connect() before its popup can open.
        // The fix landed in @base-org/account@2.5.x; until AppKit relaxes the pin, redirect
        // that single file to a local shim with the try/catch.
        '@base-org/account/dist/interface/builder/core/getInjectedProvider.js': path.resolve(
          __dirname,
          'src/shims/baseAccountGetInjectedProvider.ts',
        ),
      },
      // force esm usage for misconfigured deps' "exports" field (e.g. @use-gesture/core)
      conditions: ['module', 'import', 'browser', 'default'],
      // Dedupe packages that rely on shared React context across workspace libs.
      // Without this, pnpm creates separate copies per workspace package (different peer dep sets),
      // causing context mismatches (e.g. WagmiProvider in libs/wallet vs useConnection in libs/wallet-provider).
      dedupe: ['@reown/appkit', '@reown/appkit-adapter-wagmi', 'wagmi'],
    },

    build: {
      assetsInlineLimit: 0, // prevent inlining assets
      assetsDir: 'static', // All assets go to /static/ directory
      sourcemap: !isPreview,
      rollupOptions: {
        output: {
          // Remove hash for font files to enable preloading
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && (/StudioFeixen/i.test(assetInfo.name) || /Inter-/i.test(assetInfo.name))) {
              return 'static/[name][extname]' // Fonts without hash
            }
            return 'static/[name]-[hash][extname]' // Everything else with hash
          },
          // add distinguishable prefixes to chunk names
          chunkFileNames(chunk) {
            const chunkFileName = formatChunkFileName(chunk, {
              '/src/pages/': 'static/page-[name]-[hash].js',
              '/web3-react/connectors/': 'static/connectors-[name]-[hash].js',
              '/node_modules/lottie-react/': 'static/lottie-react-[name]-[hash].js',
              '/node_modules/@walletconnect/': 'static/@walletconnect-[name]-[hash].js',
              '/node_modules/@safe-global/': 'static/@safe-global-[name]-[hash].js',
              '/node_modules/framer-motion/': 'static/framer-motion-[name]-[hash].js',
            })
            if (chunkFileName) return chunkFileName
            return 'static/[name]-[hash].js'
          },

          manualChunks(id) {
            if (id.includes('@safe-global/safe-apps-sdk')) return '@safe-global-safe-apps-sdk' // used by some deps
            if (id.includes('@sentry')) return '@sentry'
            if (id.includes('@uniswap')) return '@uniswap'
            if (id.includes('crypto-es/lib')) return 'crypto-es'
            if (id.includes('web3/dist')) return 'web3' // was used by @1inch
            if (id.includes('@ethersproject')) return '@ethersproject'
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
