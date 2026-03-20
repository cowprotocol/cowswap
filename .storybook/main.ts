import { loadEnv, mergeConfig } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getReactProcessEnv } from '../tools/getReactProcessEnv.ts'

import type { StorybookConfig } from '@storybook/react-vite'

type WorkspacePackageJson = {
  exports?: Record<string, string | { default?: string; import?: string }>
  main?: string
  name?: string
}

function getWorkspaceEntryPoint(packageJson: WorkspacePackageJson): string | undefined {
  const rootExport = packageJson.exports?.['.']

  return typeof rootExport === 'string' ? rootExport : (rootExport?.import ?? rootExport?.default ?? packageJson.main)
}

function getWorkspaceAlias(packageJsonPath: string): [string, string] | null {
  if (!existsSync(packageJsonPath)) {
    return null
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as WorkspacePackageJson
  const entryPoint = getWorkspaceEntryPoint(packageJson)

  if (!packageJson.name || !entryPoint) {
    return null
  }

  return [packageJson.name, path.resolve(path.dirname(packageJsonPath), entryPoint)]
}

function getWorkspaceAliases(): Record<string, string> {
  return ['apps', 'libs'].reduce<Record<string, string>>((acc, rootDir) => {
    const rootPath = path.resolve(process.cwd(), rootDir)

    for (const dirName of readdirSync(rootPath)) {
      const packageJsonPath = path.resolve(rootPath, dirName, 'package.json')
      const alias = getWorkspaceAlias(packageJsonPath)

      if (!alias) {
        continue
      }

      acc[alias[0]] = alias[1]
    }

    return acc
  }, {})
}

function getStorybookProcessEnv(configType: 'DEVELOPMENT' | 'PRODUCTION'): Record<string, string> {
  const mode = configType === 'PRODUCTION' ? 'production' : 'development'
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_'])

  return {
    ...getReactProcessEnv(mode),
    'process.env': JSON.stringify(env),
  }
}

const workspaceAliases = getWorkspaceAliases()

const config: StorybookConfig = {
  stories: ['../libs/ui/src/**/*.stories.@(ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-a11y'), getAbsolutePath('@storybook/addon-docs')],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  async viteFinal(config, { configType = 'DEVELOPMENT' }) {
    return mergeConfig(config, {
      define: getStorybookProcessEnv(configType),
      plugins: [macrosPlugin(), viteTsConfigPaths({ root: process.cwd() })],
      resolve: {
        alias: workspaceAliases,
        conditions: ['module', 'import', 'browser', 'default'],
      },
    })
  },
}

export default config

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
