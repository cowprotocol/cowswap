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
    const mapped = mapSolanaSigningError(WEBKIT)

    expect(mapped instanceof Error && mapped.cause).toBe(WEBKIT)
  })

  // A provider that rejects with a plain object carries its 4001 under `cause`; normalizing that
  // object into a fresh Error would drop the chain and file the cancellation as a failure.
  it('leaves a nested rejection code reachable', () => {
    const rejection = { message: 'Request failed', cause: { code: 4001 } }

    expect(mapSolanaSigningError(rejection)).toBe(rejection)
    expect(isRejectRequestProviderError(mapSolanaSigningError(rejection))).toBe(true)
  })

  // Anything else is a real failure and has to reach the error screen with its own wording.
  it.each([
    ['an unrelated TypeError', new TypeError('amount is not a function')],
    ['a TypeError naming the version outside an `in`', new TypeError('version is not a number in this transaction')],
    ['a wallet error naming the version', new Error('unsupported transaction version')],
    ['a blockhash failure', new Error('Blockhash not found')],
  ])('passes %s through untouched', (_case, error) => {
    expect(mapSolanaSigningError(error)).toBe(error)
    expect(isRejectRequestProviderError(mapSolanaSigningError(error))).toBe(false)
  })
})
