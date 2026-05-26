import type { Plugin } from 'vite'

/**
 * Inlines `process.env.REACT_APP_*` after other transforms (e.g. vite-plugin-node-polyfills).
 * Polyfills rewrite `process` to a shim import, which prevents Vite `define` from replacing
 * `process.env.REACT_APP_*` member access in app and workspace lib source.
 */
export function reactAppEnvPostDefinePlugin(reactAppEnv: Record<string, string>): Plugin {
  return {
    name: 'cow-react-app-env-post-define',
    enforce: 'post',
    transform(code, id) {
      if (!/\.[cm]?[jt]sx?$/.test(id)) {
        return null
      }

      if (id.includes('node_modules') && !id.includes('/libs/')) {
        return null
      }

      let result = code
      let changed = false

      for (const [key, value] of Object.entries(reactAppEnv)) {
        const pattern = `process.env.${key}`
        if (result.includes(pattern)) {
          result = result.split(pattern).join(JSON.stringify(value))
          changed = true
        }
      }

      if (!changed) {
        return null
      }

      return { code: result, map: null }
    },
  }
}
