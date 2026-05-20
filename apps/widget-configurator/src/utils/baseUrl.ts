import { isDev, isLocalHost, isVercel } from '../configurator.constants'

const VERCEL_PREVIEW_URL_SUFFIX = '-cowswap-dev.vercel.app'

/** Resolved once at load; used by the configurator preview and as the default `baseUrl` in built params. */
export const CONFIGURATOR_DEFAULT_WIDGET_BASE_URL = getBaseUrl()

export function getBaseUrl(): string {
  if (typeof window === 'undefined' || !window) return ''

  if (isLocalHost) return 'http://localhost:3000'

  if (isDev) return 'https://dev.swap.cow.fi'

  if (isVercel) {
    const prKey = window.location.hostname
      .replace('widget-configurator-git-', '')
      .replace(VERCEL_PREVIEW_URL_SUFFIX, '')

    return `https://swap-dev-git-${prKey}${VERCEL_PREVIEW_URL_SUFFIX}`
  }

  return 'https://swap.cow.fi'
}

export function getEnvColor(brandColor: string, url: string): string {
  if (url.startsWith('http://localhost:')) return brandColor

  if (url.includes(VERCEL_PREVIEW_URL_SUFFIX)) return 'green'

  if (url.startsWith('https://dev.swap.cow.fi') || url.startsWith('https://dev.widget.cow.fi')) return 'orangered'

  return 'darkred'
}

export function getEnvLabel(url: string): 'Local' | 'Preview' | 'Dev' | 'Production' {
  if (url.startsWith('http://localhost:')) return 'Local'

  if (url.includes(VERCEL_PREVIEW_URL_SUFFIX)) return 'Preview'

  if (url.startsWith('https://dev.swap.cow.fi') || url.startsWith('https://dev.widget.cow.fi')) return 'Dev'

  return 'Production'
}
