import { TRACKER_COOKIE_PREFIXES, TRACKER_STORAGE_KEY_PREFIXES } from './cookieConsent.constants'

const EXPIRED_DATE = 'Thu, 01 Jan 1970 00:00:00 GMT'

export function clearTrackerStorage(): void {
  if (typeof document === 'undefined') return

  const domains = getCookieDomainCandidates(window.location.hostname)

  getCookieNames(document.cookie)
    .filter((name) => hasTrackerPrefix(name, TRACKER_COOKIE_PREFIXES))
    .forEach((name) => {
      expireCookie(name)
      domains.forEach((domain) => expireCookie(name, domain))
    })

  removeTrackerKeys(() => window.localStorage)
  removeTrackerKeys(() => window.sessionStorage)
}

export function getCookieDomainCandidates(hostname: string): string[] {
  const labels = hostname.split('.')

  return labels.slice(0, -1).flatMap((_, index) => {
    const domain = labels.slice(index).join('.')

    return [domain, `.${domain}`]
  })
}

export function hasTrackerPrefix(name: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => name.startsWith(prefix))
}

export function reloadPage(): void {
  window.location.reload()
}

function expireCookie(name: string, domain?: string): void {
  const domainAttribute = domain ? `; Domain=${domain}` : ''

  document.cookie = `${name}=; Expires=${EXPIRED_DATE}; Path=/${domainAttribute}`
}

function getCookieNames(cookieString: string): string[] {
  return cookieString
    .split(';')
    .map((part) => {
      const [name = ''] = part.split('=')

      return name.trim()
    })
    .filter(Boolean)
}

function removeTrackerKeys(getStorage: () => Storage): void {
  try {
    const storage = getStorage()
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
      (key): key is string => key !== null && hasTrackerPrefix(key, TRACKER_STORAGE_KEY_PREFIXES),
    )

    keys.forEach((key) => storage.removeItem(key))
  } catch {
    // Storage access throws when the browser blocks site data; there is nothing to clear then
  }
}
