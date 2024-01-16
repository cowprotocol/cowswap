/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import viteTsConfigPaths from 'vite-tsconfig-paths'

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
    define: {
      ...getReactProcessEnv(mode),
    },

    cacheDir: '../../node_modules/.vite/widget-configurator',

    server: {
      port: 4200,
      host: 'localhost',
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    plugins,
  }
})
