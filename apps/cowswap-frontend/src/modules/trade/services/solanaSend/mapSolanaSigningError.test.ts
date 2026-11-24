import { isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { mapSolanaSigningError } from './mapSolanaSigningError'

// What each engine says for `'version' in undefined`, which is where Trust Wallet's shim lands when
// its provider swallows a dismissed prompt and resolves `undefined`.
const WEBKIT = new TypeError(`t is not an Object. (evaluating '"version"in t')`)
const CHROME = new TypeError(`Cannot use 'in' operator to search for 'version' in undefined`)
const FIREFOX = new TypeError(`can't use 'in' operator to search for "version" in undefined`)

describe('mapSolanaSigningError', () => {
  it.each([
    ['WebKit', WEBKIT],
    ['Chrome', CHROME],
    ['Firefox', FIREFOX],
  ])('reads the %s shape as a rejection', (_engine, error) => {
    expect(isRejectRequestProviderError(mapSolanaSigningError(error))).toBe(true)
  })

  it('keeps the original error as the cause', () => {
    expect(mapSolanaSigningError(WEBKIT).cause).toBe(WEBKIT)
  })

  // Anything else is a real failure and has to reach the error screen with its own wording.
  it.each([
    ['an unrelated TypeError', new TypeError('amount is not a function')],
    ['a wallet error naming the version', new Error('unsupported transaction version')],
    ['a blockhash failure', new Error('Blockhash not found')],
  ])('passes %s through untouched', (_case, error) => {
    expect(mapSolanaSigningError(error)).toBe(error)
    expect(isRejectRequestProviderError(mapSolanaSigningError(error))).toBe(false)
  })
})
