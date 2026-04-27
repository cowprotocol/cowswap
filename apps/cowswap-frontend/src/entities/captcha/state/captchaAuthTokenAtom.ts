import { atom } from 'jotai'

/**
 * Stores the exchanged captcha auth token that is sent to the backend.
 * The raw Turnstile token is only used for the exchange step.
 */
export const captchaAuthTokenAtom = atom<string | null>(null)
