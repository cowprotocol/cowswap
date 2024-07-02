/// <reference types="vitest" />
import { version as CONTRACT_VERSION } from '@cowprotocol/contracts/package.json'

import { version as DEX_JS_VERSION } from '@gnosis.pm/dex-js/package.json'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import dynamicImport from 'vite-plugin-dynamic-import'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import { loadConfig } from './loadConfig'
import { version as APP_VERSION } from './package.json'



import { getReactProcessEnv } from '../../tools/getReactProcessEnv'


const CONFIG = loadConfig()

export default defineConfig(({ mode }) => {
  return {
    base: './',
    cacheDir: '../../node_modules/.vite/explorer',

    resolve: {
      extensions: mode === 'development' ? ['.js', '.ts', '.jsx', '.tsx', '.json'] : undefined,
    },

    define: {
      ...getReactProcessEnv(mode),
      CONFIG,
      VERSION: `'${APP_VERSION}'`,
      CONTRACT_VERSION: `'${CONTRACT_VERSION}'`,
      DEX_JS_VERSION: `'${DEX_JS_VERSION}'`,
    },

    server: {
      port: 4200,
      host: 'localhost',
      fs: {
        allow: [
          // search up for workspace root
          searchForWorkspaceRoot(process.cwd()),
          // your custom rules
          'apps/explorer/src',
          'libs',
        ],
      },
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    plugins: [
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
      react({}),
      viteTsConfigPaths({
        root: '../../',
      }),
      macrosPlugin(),
      dynamicImport({
        filter(id) {
          if (id.includes('/node_modules/@cowprotocol')) {
            return true
          }
        },
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
