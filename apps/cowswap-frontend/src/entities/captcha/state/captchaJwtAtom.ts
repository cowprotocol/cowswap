import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJwtExpiresAt, isJwtExpired } from '@cowprotocol/common-utils'

import ms from 'ms.macro'

export interface CaptchaJwt {
  token: string
  expiresAt: string
}

const CAPTCHA_JWT_STORAGE_KEY = 'captchaJwtAtom:v0'
const CAPTCHA_JWT_EXPIRY_BUFFER_MS = ms`10s`

/**
 * Stores the exchanged captcha JWT that is sent to the backend.
 * The raw Turnstile token is only used for the exchange step.
 */
const persistedCaptchaJwtAtom = atomWithStorage<string | null>(CAPTCHA_JWT_STORAGE_KEY, null, undefined, {
  getOnInit: true,
})

export const captchaJwtAtom = atom(
  (get) => {
    const token = get(persistedCaptchaJwtAtom)

    if (!token) return null

    const rawExpiresAt = getJwtExpiresAt(token)
    const rawExpiresAtMs = rawExpiresAt ? Date.parse(rawExpiresAt) : NaN

    if (Number.isNaN(rawExpiresAtMs)) return null

    const expiresAt = new Date(rawExpiresAtMs - CAPTCHA_JWT_EXPIRY_BUFFER_MS).toISOString()

    return isJwtExpired(expiresAt) ? null : { token, expiresAt }
  },
  (_get, set, token: string | null) => {
    set(persistedCaptchaJwtAtom, token)
  },
)
