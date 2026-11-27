import { atom } from 'jotai'

/** Set when a BFF call is paused by a 429, cleared only when a captcha JWT arrives. */
export const bffRateLimitedAtom = atom(false)
