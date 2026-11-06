import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { buildVirtualRows, sortTokensByBalance } from './tokensVirtualListUtils'

const mockToken = {
  address: '0xabc123',
  chainId: 1,
  decimals: 18,
  symbol: 'TEST',
  name: 'Test Token',
} as TokenWithLogo

const mockBridgeableToken = {
  address: '0xdef456',
  chainId: 1,
  decimals: 18,
  symbol: 'BRIDGE',
  name: 'Bridgeable Token',
} as TokenWithLogo

function rankedToken(
  symbol: string,
  address: string,
  rank?: unknown,
  chainId = SupportedChainId.SOLANA,
): TokenWithLogo {
  return TokenWithLogo.fromToken({ chainId, address, decimals: 6, name: symbol, symbol, extensions: { rank } })
}

describe('sortTokensByBalance', () => {
  const mintA = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  const mintB = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
  const mintC = 'So11111111111111111111111111111111111111112'

  it.each([undefined, {}])('uses Solana volume rank instead of alphabetical order with balances %p', (balances) => {
    const alphabeticalFirst = rankedToken('AAA', mintA, 20)
    const highestVolume = rankedToken('ZZZ', mintB, 1)
    const tokens = [alphabeticalFirst, highestVolume]

    expect(sortTokensByBalance(tokens, balances)).toEqual([highestVolume, alphabeticalFirst])
    expect(tokens).toEqual([alphabeticalFirst, highestVolume])
  })

  it.each([undefined, null, '1', true, 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'puts invalid rank %p after ranked tokens',
    (invalidRank) => {
      const unranked = rankedToken('AAA', mintA, invalidRank)
      const ranked = rankedToken('ZZZ', mintB, 1)

      expect(sortTokensByBalance([unranked, ranked], {})).toEqual([ranked, unranked])
    },
  )

  it('accepts the largest positive safe integer rank', () => {
    const unranked = rankedToken('AAA', mintA)
    const ranked = rankedToken('ZZZ', mintB, Number.MAX_SAFE_INTEGER)

    expect(sortTokensByBalance([unranked, ranked], {})).toEqual([ranked, unranked])
  })

  it('breaks rank ties and orders unranked tokens by symbol and case-sensitive mint', () => {
    const rankedB = rankedToken('B', mintB, 1)
    const rankedA = rankedToken('A', mintA, 1)
    const unrankedB = rankedToken('Z', `a${'1'.repeat(31)}`)
    const unrankedA = rankedToken('Z', `A${'1'.repeat(31)}`)
    const unrankedSymbol = rankedToken('C', mintC)

    expect(sortTokensByBalance([unrankedB, rankedB, unrankedA, unrankedSymbol, rankedA], {})).toEqual([
      rankedA,
      rankedB,
      unrankedSymbol,
      unrankedA,
      unrankedB,
    ])
  })

  it('keeps native first and held tokens in their existing balance order', () => {
    const native = NATIVE_CURRENCIES[SupportedChainId.SOLANA]
    const ranked = rankedToken('ZZZ', mintA, 1)
    const heldLow = rankedToken('LOW', mintB, 2)
    const heldHigh = rankedToken('HIGH', mintC, 99)
    const zeroBalance = rankedToken('AAA', 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn')
    const balances = {
      [getAddressKey(mintB)]: 2n,
      [getAddressKey(mintC)]: 10n,
      [getAddressKey(zeroBalance.address)]: 0n,
    }

    expect(sortTokensByBalance([zeroBalance, ranked, heldLow, native, heldHigh], balances)).toEqual([
      native,
      heldHigh,
      heldLow,
      ranked,
      zeroBalance,
    ])
  })

  it('breaks equal rank and symbol ties by mint, preserving case-sensitive addresses', () => {
    const first = rankedToken('SAME', `A${'1'.repeat(31)}`, 1)
    const second = rankedToken('SAME', `a${'1'.repeat(31)}`, 1)

    expect(sortTokensByBalance([second, first], {})).toEqual([first, second])
    expect(sortTokensByBalance([first, first], {})).toEqual([first, first])
  })

  it('does not use ranks to reorder equal held balances', () => {
    const heldFirst = rankedToken('AAA', mintA, 10)
    const heldSecond = rankedToken('ZZZ', mintB, 1)
    const balances = { [getAddressKey(mintA)]: 2n, [getAddressKey(mintB)]: 2n }

    expect(sortTokensByBalance([heldFirst, heldSecond], balances)).toEqual([heldFirst, heldSecond])
  })

  it('keeps native priority while ranked tokens load without balances', () => {
    const native = NATIVE_CURRENCIES[SupportedChainId.SOLANA]
    const ranked = rankedToken('AAA', mintA, 1)

    expect(sortTokensByBalance([ranked, native], undefined)).toEqual([native, ranked])
  })

  it.each([undefined, {}])('preserves the existing order when no valid ranks exist with balances %p', (balances) => {
    const tokens = [rankedToken('ZZZ', mintB), rankedToken('AAA', mintA, 0)]

    expect(sortTokensByBalance(tokens, balances)).toEqual(tokens)
  })

  it.each([undefined, {}])('preserves EVM ordering despite rank metadata with balances %p', (balances) => {
    const tokens = [
      rankedToken('AAA', '0x0000000000000000000000000000000000000001', 20, SupportedChainId.MAINNET),
      rankedToken('ZZZ', '0x0000000000000000000000000000000000000002', 1, SupportedChainId.MAINNET),
    ]

    expect(sortTokensByBalance(tokens, balances)).toEqual(tokens)
  })
})

describe('buildVirtualRows', () => {
  const defaultParams = {
    sortedTokens: [],
    favoriteTokens: [],
    recentTokens: [],
    hideFavoriteTokensTooltip: false,
    onClearRecentTokens: jest.fn(),
    bridgeSupportedTokensMap: null,
    areTokensFromBridge: false,
  }

  it('should not disable recent tokens when not in bridge mode', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockToken],
      bridgeSupportedTokensMap: null,
      areTokensFromBridge: false,
    })

    const tokenRow = result.find((r) => r.type === 'token')
    expect(tokenRow?.type).toBe('token')
    if (tokenRow?.type === 'token') {
      expect(tokenRow.disabled).toBeFalsy()
    }
  })

  it('should disable recent tokens when bridge map is loading (null)', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockToken],
      bridgeSupportedTokensMap: null,
      areTokensFromBridge: true,
    })

    const tokenRow = result.find((r) => r.type === 'token')
    expect(tokenRow?.type).toBe('token')
    if (tokenRow?.type === 'token') {
      expect(tokenRow.disabled).toBeTruthy()
    }
  })

  it('should disable recent tokens not in bridge map', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockToken],
      bridgeSupportedTokensMap: { '0xother': true },
      areTokensFromBridge: true,
    })

    const tokenRow = result.find((r) => r.type === 'token')
    expect(tokenRow?.type).toBe('token')
    if (tokenRow?.type === 'token') {
      expect(tokenRow.disabled).toBe(true)
      expect(tokenRow.disabledReason).toBeDefined()
    }
  })

  it('should not disable recent tokens that are in bridge map', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockBridgeableToken],
      bridgeSupportedTokensMap: { '0xdef456': true },
      areTokensFromBridge: true,
    })

    const tokenRow = result.find((r) => r.type === 'token')
    expect(tokenRow?.type).toBe('token')
    if (tokenRow?.type === 'token') {
      expect(tokenRow.disabled).toBe(false)
      expect(tokenRow.disabledReason).toBeUndefined()
    }
  })

  it('should handle mixed bridgeable and non-bridgeable tokens', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockToken, mockBridgeableToken],
      bridgeSupportedTokensMap: { '0xdef456': true },
      areTokensFromBridge: true,
    })

    const tokenRows = result.filter((r) => r.type === 'token')
    expect(tokenRows).toHaveLength(2)

    // First token (mockToken) should be disabled
    if (tokenRows[0]?.type === 'token') {
      expect(tokenRows[0].disabled).toBe(true)
    }

    // Second token (mockBridgeableToken) should not be disabled
    if (tokenRows[1]?.type === 'token') {
      expect(tokenRows[1].disabled).toBe(false)
    }
  })

  it('should disable recent tokens when bridge map is empty object (loaded but no routes)', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockToken],
      bridgeSupportedTokensMap: {},
      areTokensFromBridge: true,
    })

    const tokenRow = result.find((r) => r.type === 'token')
    expect(tokenRow?.type).toBe('token')
    if (tokenRow?.type === 'token') {
      expect(tokenRow.disabled).toBe(true)
      expect(tokenRow.disabledReason).toBeDefined()
    }
  })

  it('should include Recent title section when there are recent tokens', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockToken],
    })

    const titleRow = result.find((r) => r.type === 'title' && r.label === 'Recent')
    expect(titleRow).toBeDefined()
  })

  describe('hideRecentTokens', () => {
    it('should hide recent title and token rows when hideRecentTokens is true', () => {
      const result = buildVirtualRows({
        ...defaultParams,
        recentTokens: [mockToken],
        hideRecentTokens: true,
      })

      const recentTitle = result.find((r) => r.type === 'title' && r.label === 'Recent')
      expect(recentTitle).toBeUndefined()
    })

    it('should show recent tokens when hideRecentTokens is false (default)', () => {
      const result = buildVirtualRows({
        ...defaultParams,
        recentTokens: [mockToken],
        hideRecentTokens: false,
      })

      const recentTitle = result.find((r) => r.type === 'title' && r.label === 'Recent')
      expect(recentTitle).toBeDefined()
    })
  })

  describe('hideFavoriteTokens', () => {
    it('should hide favorite section when hideFavoriteTokens is true', () => {
      const result = buildVirtualRows({
        ...defaultParams,
        favoriteTokens: [mockToken],
        hideFavoriteTokens: true,
      })

      const favSection = result.find((r) => r.type === 'favorite-section')
      expect(favSection).toBeUndefined()
    })

    it('should show favorite section when hideFavoriteTokens is false (default)', () => {
      const result = buildVirtualRows({
        ...defaultParams,
        favoriteTokens: [mockToken],
        hideFavoriteTokens: false,
      })

      const favSection = result.find((r) => r.type === 'favorite-section')
      expect(favSection).toBeDefined()
    })
  })

  describe('All tokens title', () => {
    it('does not render the title when recent and favorite sections are both hidden', () => {
      const result = buildVirtualRows({
        ...defaultParams,
        sortedTokens: [mockToken],
        recentTokens: [mockToken],
        favoriteTokens: [mockBridgeableToken],
        hideRecentTokens: true,
        hideFavoriteTokens: true,
      })

      const allTokensTitle = result.find((r) => r.type === 'title' && r.label === 'All tokens')
      expect(allTokensTitle).toBeUndefined()
    })

    it('renders the title when at least one extra section is visible', () => {
      const result = buildVirtualRows({
        ...defaultParams,
        sortedTokens: [mockToken],
        recentTokens: [mockToken],
        hideFavoriteTokens: true,
      })

      const allTokensTitle = result.find((r) => r.type === 'title' && r.label === 'All tokens')
      expect(allTokensTitle).toBeDefined()
    })

    it('does not render the title without tokens below it', () => {
      const result = buildVirtualRows({
        ...defaultParams,
        sortedTokens: [],
        recentTokens: [mockToken],
      })

      const allTokensTitle = result.find((r) => r.type === 'title' && r.label === 'All tokens')
      expect(allTokensTitle).toBeUndefined()
    })
  })
})
