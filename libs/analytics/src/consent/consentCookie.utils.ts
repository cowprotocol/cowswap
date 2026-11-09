import {
  COOKIE_CONSENT_MAX_AGE_MS,
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_POLICY_VERSION,
  COOKIE_CONSENT_SHARED_DOMAIN,
} from './cookieConsent.constants'
import { CookieConsentChoice, CookieConsentRecord } from './cookieConsent.types'

const CONSENT_CHOICES: CookieConsentChoice[] = ['accepted', 'rejected']

export function createConsentRecord(choice: CookieConsentChoice, now: number): CookieConsentRecord {
  return {
    v: 1,
    choice,
    decidedAt: new Date(now).toISOString(),
    policyVersion: COOKIE_CONSENT_POLICY_VERSION,
  }
}

export function getConsentCookieDomain(hostname: string): string | undefined {
  const isSharedDomain =
    hostname === COOKIE_CONSENT_SHARED_DOMAIN || hostname.endsWith(`.${COOKIE_CONSENT_SHARED_DOMAIN}`)

  return isSharedDomain ? `.${COOKIE_CONSENT_SHARED_DOMAIN}` : undefined
}

export function getRemainingLifetimeMs(record: CookieConsentRecord, now: number): number {
  const decidedAt = Date.parse(record.decidedAt)

  return Math.min(COOKIE_CONSENT_MAX_AGE_MS, decidedAt + COOKIE_CONSENT_MAX_AGE_MS - now)
}

export function parseConsentRecord(rawValue: string | undefined, now: number): CookieConsentRecord | null {
  if (!rawValue) return null

  let parsed: unknown

  try {
    parsed = JSON.parse(decodeURIComponent(rawValue))
  } catch {
    return null
  }

  if (!isConsentRecord(parsed)) return null
  if (parsed.policyVersion !== COOKIE_CONSENT_POLICY_VERSION) return null
  if (getRemainingLifetimeMs(parsed, now) <= 0) return null

  return parsed
}

export function readConsentCookie(now: number): CookieConsentRecord | null {
  if (typeof document === 'undefined') return null

  return parseConsentRecord(readCookieValue(document.cookie, COOKIE_CONSENT_NAME), now)
}

export function readCookieValue(cookieString: string, name: string): string | undefined {
  const prefix = `${name}=`
  const cookie = cookieString
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return cookie?.slice(prefix.length)
}

export function writeConsentCookie(record: CookieConsentRecord, now: number): void {
  if (typeof document === 'undefined') return

  const maxAgeSeconds = Math.max(0, Math.floor(getRemainingLifetimeMs(record, now) / 1000))
  const attributes = [`Max-Age=${maxAgeSeconds}`, 'Path=/', 'SameSite=Lax']
  const domain = getConsentCookieDomain(window.location.hostname)

  if (domain) attributes.push(`Domain=${domain}`)
  if (window.location.protocol === 'https:') attributes.push('Secure')

  document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(JSON.stringify(record))}; ${attributes.join('; ')}`
}

function isConsentRecord(value: unknown): value is CookieConsentRecord {
  if (typeof value !== 'object' || value === null) return false

  const record = value as Record<string, unknown>

  return (
    record['v'] === 1 &&
    CONSENT_CHOICES.includes(record['choice'] as CookieConsentChoice) &&
    typeof record['decidedAt'] === 'string' &&
    !Number.isNaN(Date.parse(record['decidedAt'])) &&
    typeof record['policyVersion'] === 'number'
  )
}
