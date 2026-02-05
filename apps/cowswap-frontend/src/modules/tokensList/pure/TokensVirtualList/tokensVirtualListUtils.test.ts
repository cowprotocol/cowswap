import { TokenWithLogo } from '@cowprotocol/common-const'

import { buildVirtualRows } from './tokensVirtualListUtils'

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

  it('should not disable recent tokens when bridge map is loading (null)', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockToken],
      bridgeSupportedTokensMap: null,
      areTokensFromBridge: true,
    })

    const tokenRow = result.find((r) => r.type === 'token')
    expect(tokenRow?.type).toBe('token')
    if (tokenRow?.type === 'token') {
      expect(tokenRow.disabled).toBeFalsy()
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

  it('should include Recent title section when there are recent tokens', () => {
    const result = buildVirtualRows({
      ...defaultParams,
      recentTokens: [mockToken],
    })

    const titleRow = result.find((r) => r.type === 'title' && r.label === 'Recent')
    expect(titleRow).toBeDefined()
  })
})
