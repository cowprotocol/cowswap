import { UserConfig } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import dts from 'vite-plugin-dts'

import { join } from 'path'

import { getPrivateWorkspacePackages } from './getPrivateWorkspacePackages'

const privatePackages = getPrivateWorkspacePackages()

const defaultExternalDeps = ['react', /@cowprotocol/, /@ethersproject/]

export function viteConfigPublishableLib(
  dirname: string,
  libName: string,
  additionalExternalDeps: (string | RegExp)[] = [],
): UserConfig {
  const externalDeps = [...defaultExternalDeps, ...additionalExternalDeps]
  return {
    root: join(dirname, './'),
    build: {
      lib: {
        entry: 'src/index.ts',
        name: libName,
        formats: ['es', 'cjs'],
        fileName: 'index',
      },
      outDir: '../../dist/libs/' + libName,
      emptyOutDir: true,
      rollupOptions: {
        external: (id: string) => {
          if (externalDeps.some((dep) => (typeof dep === 'string' ? dep === id : dep.test(id)))) return true
          // Inline private workspace packages into the bundle
          if (privatePackages.has(id)) return false
          // Externalize all other imports (npm packages and published workspace packages)
          return !id.startsWith('.') && !id.startsWith('/')
        },
      },
    },
    plugins: [
      macrosPlugin(),
      dts({
        entryRoot: 'src',
        tsconfigPath: join(dirname, 'tsconfig.lib.json'),
      }),
    ],
  }
}
