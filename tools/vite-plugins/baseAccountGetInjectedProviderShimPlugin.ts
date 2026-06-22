import * as path from 'path'

import type { Plugin } from 'vite'

const GET_INJECTED_PROVIDER_PATTERN = /(^|[\\/])getInjectedProvider(\.js)?$/

/**
 * Redirects @base-org/account's getInjectedProvider to our cross-origin-safe shim.
 * Required for both dev (Rollup) and production builds — resolve.alias alone does not
 * rewrite the relative import inside createBaseAccountSDK.js.
 */
export function baseAccountGetInjectedProviderShimPlugin(appDir: string): Plugin {
  const shim = path.resolve(appDir, 'src/shims/baseAccountGetInjectedProvider.ts')

  return {
    name: 'cow-base-account-getInjectedProvider-shim',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer?.includes('@base-org/account')) {
        return null
      }

      if (!GET_INJECTED_PROVIDER_PATTERN.test(source)) {
        return null
      }

      return shim
    },
  }
}
