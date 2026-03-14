import { atom } from 'jotai'

/**
 * Stores the turnstile verification token after successful challenge completion.
 * Use this token when making API requests that require bot protection.
 */
export const turnstileTokenAtom = atom<string | null>(null)
