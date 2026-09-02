import { UserConfig } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import dts from 'vite-plugin-dts'

import { globSync } from 'node:fs'
import { join } from 'path'

import { getPrivateWorkspacePackages } from './getPrivateWorkspacePackages'

const privatePackages = getPrivateWorkspacePackages()

const defaultExternalDeps = ['react', /@cowprotocol/, /@ethersproject/]

type PublishableLibOptions = {
  additionalExternalDeps?: (string | RegExp)[]
  preserveModules?: boolean
}

export function viteConfigPublishableLib(
  dirname: string,
  libName: string,
  { additionalExternalDeps = [], preserveModules = false }: PublishableLibOptions = {},
): UserConfig {
  const externalDeps = [...defaultExternalDeps, ...additionalExternalDeps]
  const sourceEntries = preserveModules
    ? Object.fromEntries(
        globSync('src/**/*.{ts,tsx}', {
          cwd: dirname,
          exclude: ['src/**/*.spec.*', 'src/**/*.test.*'],
        }).map((file) => [file.slice(4).replace(/\.[^.]+$/, ''), file]),
      )
    : 'src/index.ts'

  return {
    root: join(dirname, './'),
    build: {
      lib: {
        entry: sourceEntries,
        name: libName,
        formats: ['es', 'cjs'],
        fileName: preserveModules ? (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}` : 'index',
      },
      outDir: '../../dist/libs/' + libName,
      emptyOutDir: true,
      rollupOptions: {
        output: preserveModules
          ? {
              preserveModules: true,
              preserveModulesRoot: 'src',
            }
          : undefined,
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
