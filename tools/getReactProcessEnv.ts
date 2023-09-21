import { loadEnv } from 'vite'

export function getReactProcessEnv(mode: string): { [key: string]: string } {
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_'])

  // expose .env as process.env instead of import.meta since jest does not import meta yet
  return Object.entries(env).reduce((prev, [key, val]) => {
    return {
      ...prev,
      ['process.env.' + key]: JSON.stringify(val),
    }
  }, {})
}
