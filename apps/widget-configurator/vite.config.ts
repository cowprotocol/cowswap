/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import * as path from 'path'

import { getReactProcessEnv } from '../../tools/getReactProcessEnv'

const plugins = [
  nodePolyfills({
    include: ['stream'],
    globals: {
      Buffer: true,
      global: true,
      process: true,
    },
    protocolImports: true,
  }),
  macrosPlugin(),
  react(),
  viteTsConfigPaths({
    root: '../../',
  }),
]

export default defineConfig(({ mode }) => {
  return {
    root: path.resolve(__dirname, './'),
    define: {
      ...getReactProcessEnv(mode),
    },

    cacheDir: '../../node_modules/.vite/widget-configurator',

    server: {
      port: 4200,
      host: 'localhost',
      fs: {
        allow: [
          // search up for workspace root
          searchForWorkspaceRoot(process.cwd()),
          // your custom rules
          'apps/widget-configurator/src',
          'libs',
        ],
      },
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    plugins,
  }
})
