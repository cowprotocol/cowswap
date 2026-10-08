import { getTotalExclusions } from './totalExclusions'

jest.mock('@/shared/lib/chain', () => ({
  getChainLabel: (chainId: number) => ({ 1: 'Ethereum', 56: 'BNB' })[chainId] ?? `Chain ${chainId}`,
}))

describe('getTotalExclusions', () => {
  it('is null for a complete total', () => {
    expect(getTotalExclusions(0, [])).toBeNull()
  })

  it('names the chains whose balances failed', () => {
    expect(getTotalExclusions(0, [1, 56])).toBe('Excludes balances on Ethereum, BNB')
  })

  it('does not count unpriced assets while prices load', () => {
    expect(getTotalExclusions(null, [])).toBeNull()
    expect(getTotalExclusions(null, [56])).toBe('Excludes balances on BNB')
  })

  it('counts the unpriced assets', () => {
    expect(getTotalExclusions(1, [])).toBe('Excludes 1 asset without a price')
    expect(getTotalExclusions(2, [56])).toBe('Excludes balances on BNB and 2 assets without a price')
  })
})
