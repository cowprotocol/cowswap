import { isDevelopmentEnv } from './env'

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

export interface SafeLinkResult {
  href: string
  isExternal: boolean
}

function isLocalDevHostname(hostname: string): boolean {
  const normalizedHostname = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname

  return LOCALHOST_HOSTNAMES.has(normalizedHostname) || normalizedHostname.endsWith('.localhost')
}

function isAllowedHttpUrl(url: URL): boolean {
  if (url.username || url.password) return false
  if (url.protocol === 'https:') return true

  return url.protocol === 'http:' && isDevelopmentEnv() && isLocalDevHostname(url.hostname)
}

export function getSafeAbsoluteUrl(href: string | null | undefined): string | null {
  if (!href) return null

  try {
    const url = new URL(href)

    if (!isAllowedHttpUrl(url)) return null

    const isBareOrigin = url.pathname === '/' && !url.search && !url.hash

    return isBareOrigin ? url.origin : url.toString()
  } catch {
    return null
  }
}

export function getSafeSameOriginOrAbsoluteUrl(
  href: string | null | undefined,
  currentOrigin: string,
): SafeLinkResult | null {
  if (!href) return null
  if (href.startsWith('//')) return null

  if (href.startsWith('/')) {
    return { href, isExternal: false }
  }

  const safeAbsoluteUrl = getSafeAbsoluteUrl(href)
  if (!safeAbsoluteUrl) return null

  return {
    href: safeAbsoluteUrl,
    isExternal: new URL(safeAbsoluteUrl).origin !== currentOrigin,
  }
}
