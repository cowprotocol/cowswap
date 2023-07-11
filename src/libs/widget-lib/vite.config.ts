/// <reference types="vitest" />
import { joinPathFragments } from '@nx/devkit'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    const entryPoint = './src/demo/index.html'

    return {
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
    cacheDir: '../../../node_modules/.vite/widget-lib',

    plugins: [
      dts({
        entryRoot: 'src',
        tsConfigFilePath: joinPathFragments(__dirname, 'tsconfig.lib.json'),
        skipDiagnostics: true,
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
        name: 'widget-lib',
        fileName: 'index',
        // Change this to the formats you want to support.
        // Don't forgot to update your package.json as well.
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [],
      },
    },
  }
})
