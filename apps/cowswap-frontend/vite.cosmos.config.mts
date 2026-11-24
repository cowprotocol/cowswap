import { defineConfig, type ConfigEnv, type PluginOption, type UserConfig } from 'vite'

import baseConfig from './vite.config.mts'

/**
 * Cosmos re-scans index.html after Vite hashes the module script. `/emergency.js`
 * is then a second script, and react-cosmos-plugin-vite throws "Multiple script paths".
 * The app build still loads emergency.js from index.html.
 */
const stripEmergencyScript: PluginOption = {
  name: 'cosmos-strip-emergency-script',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace(/<script\s+src="\/emergency\.js"><\/script>\s*/g, '')
    },
  },
}

/**
 * Cosmos' main chunk is larger than the service-worker precache cap, so vite-plugin-pwa
 * fails the export. Fixtures do not need a service worker. Drop every PWA plugin together;
 * leaving `vite-plugin-pwa:build` without its parent crashes in closeBundle.
 */
function withoutPwa(plugins: PluginOption[] | undefined): PluginOption[] {
  return (plugins ?? []).flatMap((plugin) => {
    if (!plugin || typeof plugin === 'boolean') return []
    if (Array.isArray(plugin)) return withoutPwa(plugin)
    if (typeof plugin === 'object' && 'then' in plugin) return [plugin]

    const name = 'name' in plugin ? plugin.name : ''
    if (name.startsWith('vite-plugin-pwa')) return []

    return [plugin]
  })
}

export default defineConfig(async (env: ConfigEnv) => {
  const resolved = typeof baseConfig === 'function' ? await baseConfig(env) : baseConfig
  const base = resolved as UserConfig

  return {
    ...base,
    plugins: [stripEmergencyScript, ...withoutPwa(base.plugins)],
  }
})
