import { atom } from 'jotai'

let turnstileToken: string | null = null

const _turnstileTokenAtom = atom<string | null>(null)

/**
 * Stores the Cloudflare Turnstile verification token after successful challenge completion.
 * Use this token when making API requests that require bot protection.
 */
export const turnstileTokenAtom = atom(
  (get) => get(_turnstileTokenAtom),
  (_, set, nextToken: string | null) => {
    turnstileToken = nextToken
    set(_turnstileTokenAtom, nextToken)
  },
)

export function getTurnstileToken(): string | null {
  return turnstileToken
}
