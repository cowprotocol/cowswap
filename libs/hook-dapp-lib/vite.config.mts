/// <reference types="vitest" />
import { joinPathFragments } from '@nx/devkit'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import * as path from 'path'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    const entryPoint = './src/demo/index.html'

    return {
      root: path.resolve(__dirname, './'),
      server: {
        open: entryPoint,
        fs: {
          allow: ['..'],
        },
      },
      build: {
        rollupOptions: {
          input: {
            main: entryPoint,
          },
        },
      },
    }
  }

  return {
    root: path.resolve(__dirname, './'),
    cacheDir: '../../../node_modules/.vite/hook-dapp-lib',

    plugins: [
      dts({
        entryRoot: 'src',
        tsconfigPath: joinPathFragments(__dirname, 'tsconfig.lib.json'),
        pathsToAliases: false,
      }),
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
        name: 'cowSwapWidget',
        fileName: 'index',
        // Change this to the formats you want to support.
        // Don't forgot to update your package.json as well.
        formats: ['es', 'cjs', 'iife'],
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [],
      },
    },
  }
})
