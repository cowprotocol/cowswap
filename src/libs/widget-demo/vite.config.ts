/// <reference types="vitest" />
import { joinPathFragments } from '@nx/devkit'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '/widget-demo/',
  cacheDir: '../../../node_modules/.vite/widget-demo',
  plugins: [tsconfigPaths(), viteSingleFile()],
  build: {
    rollupOptions: {
      input: {
        main: joinPathFragments(__dirname, './src/index.html'),
      },
    },
  },
})
