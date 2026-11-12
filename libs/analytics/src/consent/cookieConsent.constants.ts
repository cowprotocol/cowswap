export const COOKIE_CONSENT_NAME = 'cowCookieConsent'

/** Bump to ask everyone again after a material change to the cookie notice */
export const COOKIE_CONSENT_POLICY_VERSION = 1

/** Milliseconds; 180 days */
export const COOKIE_CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000

export const COOKIE_CONSENT_SHARED_DOMAIN = 'cow.fi'

export const TRACKER_COOKIE_PREFIXES = [
  '_ga',
  '_gid',
  '_gat',
  '_gcl_',
  '_rdt_',
  '_twclid',
  '_clck',
  '_clsk',
  'spdl_',
  '___adrsbl',
  '__adroll',
  '__ar_v4',
  'first_utm_',
]

export const TRACKER_STORAGE_KEY_PREFIXES = [
  'spindl_',
  '____sfry_',
  '___adrsbl',
  '_gcl_',
  'swapped_addresses',
  'first_utm_',
]
