/// <reference types="vitest" />
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { loadConfig } from './loadConfig'
import dynamicImport from 'vite-plugin-dynamic-import'

import { version as APP_VERSION } from './package.json'
import { version as CONTRACT_VERSION } from '@cowprotocol/contracts/package.json'
import { version as DEX_JS_VERSION } from '@gnosis.pm/dex-js/package.json'

const CONFIG = loadConfig()
const APP_DATA_SCHEMAS_PATH = 'node_modules/@cowprotocol/app-data/schemas'

export default defineConfig({
  base: './',
  cacheDir: '../../node_modules/.vite/explorer',

  define: {
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
        APP_DATA_SCHEMAS_PATH,
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
    dynamicImport({
      filter(id) {
        if (id.includes(APP_DATA_SCHEMAS_PATH)) {
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
})
