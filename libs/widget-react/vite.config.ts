/// <reference types="vitest" />
import { joinPathFragments } from '@nx/devkit'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import { writeFileSync } from 'fs'
import { join } from 'path'

// Workaround to generate the declaration file for the bundle in a way that does not replace the import of the widget-lib with a local path
// If you know a better way to do this, please let me know
function generateBundleDeclarationFile(outDir: string) {
  return {
    name: 'generate-bundle-declaration-file',
    writeBundle() {
      const content = `export * from './lib/CowSwapWidget';\nexport * from '@cowprotocol/widget-lib';`
      const outputPath = join(outDir, 'index.d.ts')
      writeFileSync(outputPath, content)
      console.log(`Generated declaration file at: ${outputPath}`)
    },
  }
}

export default defineConfig({
  cacheDir: '../../../node_modules/.vite/widget-react',

  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: joinPathFragments(__dirname, 'tsconfig.lib.json'),
    }),
    react(),
    viteTsConfigPaths({
      root: '../../../',
    }),
    generateBundleDeclarationFile('dist/libs/widget-react'),
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
      name: 'widget-react',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
