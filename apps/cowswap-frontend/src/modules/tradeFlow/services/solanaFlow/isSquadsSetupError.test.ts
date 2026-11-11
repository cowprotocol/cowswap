import { isSquadsSetupError } from './isSquadsSetupError'

const SQUADS_MESSAGE = 'this extension is not an active proposer on the selected multisig'

describe('isSquadsSetupError', () => {
  it('matches the message SquadsX refuses an unconfigured extension with', () => {
    expect(isSquadsSetupError(new Error(SQUADS_MESSAGE))).toBe(true)
  })

  it('matches it as a bare string, which is how some adapters rethrow it', () => {
    expect(isSquadsSetupError(SQUADS_MESSAGE)).toBe(true)
  })

  // Wallet adapters wrap the underlying refusal in their own error, leaving the top-level message
  // generic — the same chain walk the rejection and insufficient-funds checks do.
  it('finds it on the cause chain', () => {
    const wrapped = new Error('Unexpected error', { cause: new Error(SQUADS_MESSAGE) })

    expect(isSquadsSetupError(wrapped)).toBe(true)
  })

  it('ignores any other failure', () => {
    expect(isSquadsSetupError(new Error('User rejected the request'))).toBe(false)
    expect(isSquadsSetupError(undefined)).toBe(false)
    expect(isSquadsSetupError(null)).toBe(false)
  })

  it('survives a cyclic cause chain', () => {
    const cyclic = new Error('Unexpected error')
    Object.assign(cyclic, { cause: { message: 'Still unexpected', cause: cyclic } })

    expect(isSquadsSetupError(cyclic)).toBe(false)
  })
})
