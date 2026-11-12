import {
  createConsentRecord,
  getConsentCookieDomain,
  getRemainingLifetimeMs,
  parseConsentRecord,
  readConsentCookie,
  readCookieValue,
  writeConsentCookie,
} from './consentCookie.utils'
import {
  COOKIE_CONSENT_MAX_AGE_MS,
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_POLICY_VERSION,
} from './cookieConsent.constants'

const NOW = Date.parse('2026-11-09T12:00:00.000Z')
const DAY_MS = 24 * 60 * 60 * 1000

function clearCookies(): void {
  document.cookie.split(';').forEach((part) => {
    const [name = ''] = part.split('=')

    document.cookie = `${name.trim()}=; Max-Age=0; Path=/`
  })
}

function encode(value: unknown): string {
  return encodeURIComponent(JSON.stringify(value))
}

describe('getConsentCookieDomain', () => {
  it.each([
    ['cow.fi', '.cow.fi'],
    ['swap.cow.fi', '.cow.fi'],
    ['barn.explorer.cow.fi', '.cow.fi'],
    ['notcow.fi', undefined],
    ['localhost', undefined],
    ['swap-dev-git-branch.vercel.app', undefined],
  ])('returns the cookie domain for %s', (hostname, expected) => {
    expect(getConsentCookieDomain(hostname)).toBe(expected)
  })
})

describe('parseConsentRecord', () => {
  it('returns a valid record', () => {
    const record = createConsentRecord('accepted', NOW)

    expect(parseConsentRecord(encode(record), NOW)).toEqual(record)
  })

  it.each([
    ['missing value', undefined],
    ['malformed JSON', '%7Bnot-json'],
    ['unknown choice', encode({ ...createConsentRecord('accepted', NOW), choice: 'maybe' })],
    ['invalid date', encode({ ...createConsentRecord('accepted', NOW), decidedAt: 'yesterday' })],
    [
      'older policy version',
      encode({ ...createConsentRecord('accepted', NOW), policyVersion: COOKIE_CONSENT_POLICY_VERSION - 1 }),
    ],
  ])('returns null for %s', (_, rawValue) => {
    expect(parseConsentRecord(rawValue, NOW)).toBeNull()
  })

  it('keeps a choice made just under 180 days ago', () => {
    const record = createConsentRecord('rejected', NOW - 179 * DAY_MS)

    expect(parseConsentRecord(encode(record), NOW)).toEqual(record)
  })

  it('drops a choice older than 180 days', () => {
    const record = createConsentRecord('accepted', NOW - 181 * DAY_MS)

    expect(parseConsentRecord(encode(record), NOW)).toBeNull()
  })
})

describe('getRemainingLifetimeMs', () => {
  it('counts down from the decision date', () => {
    const record = createConsentRecord('accepted', NOW - 30 * DAY_MS)

    expect(getRemainingLifetimeMs(record, NOW)).toBe(COOKIE_CONSENT_MAX_AGE_MS - 30 * DAY_MS)
  })

  it('never exceeds the maximum when the decision date is in the future', () => {
    const record = createConsentRecord('accepted', NOW + 10 * DAY_MS)

    expect(getRemainingLifetimeMs(record, NOW)).toBe(COOKIE_CONSENT_MAX_AGE_MS)
  })
})

describe('readCookieValue', () => {
  it('reads the named cookie only', () => {
    const cookieString = `x${COOKIE_CONSENT_NAME}=wrong; _ga=GA1.1; ${COOKIE_CONSENT_NAME}=right`

    expect(readCookieValue(cookieString, COOKIE_CONSENT_NAME)).toBe('right')
  })

  it('returns undefined when the cookie is missing', () => {
    expect(readCookieValue('_ga=GA1.1', COOKIE_CONSENT_NAME)).toBeUndefined()
  })
})

describe('writeConsentCookie', () => {
  afterEach(clearCookies)

  it('stores a record that reads back unchanged', () => {
    const now = Date.now()
    const record = createConsentRecord('accepted', now)

    writeConsentCookie(record, now)

    expect(readConsentCookie(now)).toEqual(record)
  })
})
