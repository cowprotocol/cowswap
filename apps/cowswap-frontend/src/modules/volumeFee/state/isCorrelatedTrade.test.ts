import { CorrelatedTokens } from 'entities/correlatedTokens/state/correlatedTokensAtom'

import { isCorrelatedTrade } from './isCorrelatedTrade'

const INPUT = '0xinput'
const OUTPUT = '0xoutput'
const INTERMEDIATE = '0xintermediate'

describe('isCorrelatedTrade', () => {
  it('returns true when a global correlated token matches one of the addresses (same-chain)', () => {
    const correlatedTokens: CorrelatedTokens[] = [{ [INTERMEDIATE]: 'INT' }, { [INPUT]: 'IN' }]
    expect(isCorrelatedTrade(INPUT, OUTPUT, correlatedTokens)).toBe(true)
  })

  it('returns true when a pair correlated token matches both addresses (same-chain)', () => {
    const correlatedTokens: CorrelatedTokens[] = [{ [INPUT]: 'IN', [OUTPUT]: 'OUT' }]
    expect(isCorrelatedTrade(INPUT, OUTPUT, correlatedTokens)).toBe(true)
  })

  it('returns true for bridge when intermediate is in global correlated list', () => {
    const correlatedTokens: CorrelatedTokens[] = [{ [INTERMEDIATE]: 'INT' }]
    expect(isCorrelatedTrade(INPUT, INTERMEDIATE, correlatedTokens)).toBe(true)
  })

  it('returns true for bridge when input and intermediate form a correlated pair', () => {
    const correlatedTokens: CorrelatedTokens[] = [{ [INPUT]: 'IN', [INTERMEDIATE]: 'INT' }]
    expect(isCorrelatedTrade(INPUT, INTERMEDIATE, correlatedTokens)).toBe(true)
  })

  it('returns false for bridge when intermediate is not in correlated list', () => {
    const correlatedTokens: CorrelatedTokens[] = [{ '0xother': 'OTHER' }]
    expect(isCorrelatedTrade(INPUT, INTERMEDIATE, correlatedTokens)).toBe(false)
  })

  it('returns false when no correlated entry matches', () => {
    const correlatedTokens: CorrelatedTokens[] = [{ [INTERMEDIATE]: 'INT' }, { '0xother': 'OTHER' }]
    expect(isCorrelatedTrade(INPUT, OUTPUT, correlatedTokens)).toBe(false)
  })

  it('returns false when pair requires both but only one address is in the list', () => {
    const correlatedTokens: CorrelatedTokens[] = [{ [INPUT]: 'IN', [OUTPUT]: 'OUT' }]
    expect(isCorrelatedTrade(INPUT, '', correlatedTokens)).toBe(false)
  })
})
