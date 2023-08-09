/// <reference types="vitest" />
import { lingui } from '@lingui/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv, searchForWorkspaceRoot, splitVendorChunkPlugin } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const coreDeps = [
  'node_modules/react',
  'node_modules/redux',
  'node_modules/styled-components',
  'node_modules/swr',
  'node_modules/react-router-dom',
  'node_modules/jotai',
  'node_modules/@cowprotocol/',
  'node_modules/@uniswap/',
  'node_modules/@safe-global/',
  'node_modules/@web3-react/',
  'node_modules/@lingui/',
  'node_modules/@sentry/',
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_'])

  // expose .env as process.env instead of import.meta since jest does not import meta yet
  const envWithProcessPrefix = Object.entries(env).reduce((prev, [key, val]) => {
    return {
      ...prev,
      ['process.env.' + key]: JSON.stringify(val),
    }
  }, {})

  return {
    define: {
      ...envWithProcessPrefix,
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
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (coreDeps.some((dep) => id.includes(dep))) {
              return 'core-vendor'
            }

            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
    },

    plugins: [
      splitVendorChunkPlugin(),
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
        mode: mode.startsWith('dev') ? 'development' : 'production',
        registerType: 'autoUpdate',
        injectRegister: 'auto',
      }),
    ],

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
