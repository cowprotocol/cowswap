/// <reference types="vitest" />
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { ModuleNameWithoutNodePrefix, nodePolyfills } from 'vite-plugin-node-polyfills'
import stdLibBrowser from 'node-stdlib-browser'
import { loadConfig } from './loadConfig'

import { version as APP_VERSION } from './package.json'
import { version as CONTRACT_VERSION } from '@cowprotocol/contracts/package.json'
import { version as DEX_JS_VERSION } from '@gnosis.pm/dex-js/package.json'

const CONFIG = loadConfig()

const allNodeDeps = Object.keys(stdLibBrowser).map((key) => key.replace('node:', '')) as ModuleNameWithoutNodePrefix[]

// Trezor getAccountsAsync() requires crypto and stream (the module is lazy-loaded)
const nodeDepsToInclude = ['crypto', 'stream']

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
      exclude: allNodeDeps.filter((dep) => !nodeDepsToInclude.includes(dep)),
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
