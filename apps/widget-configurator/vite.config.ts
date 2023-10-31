/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import viteTsConfigPaths from 'vite-tsconfig-paths'

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
  react(),
  viteTsConfigPaths({
    root: '../../',
  }),
]

export default defineConfig({
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
})
