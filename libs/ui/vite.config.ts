/// <reference types="vitest" />
import { joinPathFragments } from '@nx/devkit'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import dts from 'vite-plugin-dts'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/ui',

  plugins: [
    macrosPlugin(),
    dts({
      entryRoot: 'src',
      tsconfigPath: joinPathFragments(__dirname, 'tsconfig.lib.json'),
    }),
    react(),
    viteTsConfigPaths({
      root: '../../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../../',
  //    }),
  //  ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'ui',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
