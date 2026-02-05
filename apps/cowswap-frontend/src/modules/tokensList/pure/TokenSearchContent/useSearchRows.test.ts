import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useSearchRows } from './useSearchRows'

// Helper to create valid Ethereum addresses
const toAddress = (suffix: string | number): string => `0x${suffix.toString().padStart(40, '0')}`

// Helper to create test tokens
function createToken(
  symbol: string,
  addressSuffix: string | number,
  name: string,
  chainId: SupportedChainId = SupportedChainId.SEPOLIA,
): TokenWithLogo {
  return new TokenWithLogo(undefined, chainId, toAddress(addressSuffix), 18, symbol, name)
}

// Helper to create multiple tokens
function createTokens(count: number, prefix = 'TOKEN'): TokenWithLogo[] {
  return Array.from({ length: count }, (_, i) => createToken(`${prefix}${i}`, i, `${prefix} ${i}`))
}

// eslint-disable-next-line max-lines-per-function
describe('useSearchRows', () => {
  describe('Loading State', () => {
    it('should return empty array when isLoading is true', () => {
      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: true,
          matchedTokens: [createToken('TOKEN', 1, 'Test Token')],
          activeList: [createToken('TOKEN2', 2, 'Test Token 2')],
          blockchainResult: [createToken('TOKEN3', 3, 'Test Token 3')],
          inactiveListsResult: [createToken('TOKEN4', 4, 'Test Token 4')],
          externalApiResult: [createToken('TOKEN5', 5, 'Test Token 5')],
        }),
      )

      expect(result.current).toEqual([])
    })

    it('should ignore all token arrays when loading', () => {
      const matchedTokens = [createToken('MATCHED', 1, 'Matched Token')]
      const activeList = [createToken('ACTIVE', 2, 'Active Token')]

      const { result: loadingResult } = renderHook(() =>
        useSearchRows({
          isLoading: true,
          matchedTokens,
          activeList,
          blockchainResult: [createToken('BLOCKCHAIN', 3, 'Blockchain Token')],
          inactiveListsResult: [createToken('INACTIVE', 4, 'Inactive Token')],
          externalApiResult: [createToken('EXTERNAL', 5, 'External Token')],
        }),
      )

      expect(loadingResult.current).toEqual([])

      const { result: notLoadingResult } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens,
          activeList,
        }),
      )

      expect(notLoadingResult.current.length).toBeGreaterThan(0)
    })
  })

  describe('Banner Row', () => {
    it('should always include banner row as first entry when not loading', () => {
      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
        }),
      )

      expect(result.current.length).toBeGreaterThan(0)
      expect(result.current[0]).toEqual({ type: 'banner' })
    })

    it('should have correct banner row type', () => {
      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
        }),
      )

      const bannerRow = result.current[0]
      expect(bannerRow).toEqual({ type: 'banner' })
    })
  })

  describe('Matched Tokens', () => {
    it('should add matched tokens with correct structure', () => {
      const token1 = createToken('TOKEN1', 1, 'Token 1')
      const token2 = createToken('TOKEN2', 2, 'Token 2')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [token1, token2],
          activeList: [],
        }),
      )

      expect(result.current[0]).toEqual({ type: 'banner' })
      expect(result.current[1]).toEqual({ type: 'token', token: token1, disabled: false, disabledReason: undefined })
      expect(result.current[2]).toEqual({ type: 'token', token: token2, disabled: false, disabledReason: undefined })
    })

    it('should preserve order of matched tokens', () => {
      const token1 = createToken('TOKEN1', 1, 'Token 1')
      const token2 = createToken('TOKEN2', 2, 'Token 2')
      const token3 = createToken('TOKEN3', 3, 'Token 3')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [token1, token2, token3],
          activeList: [],
        }),
      )

      const tokenRows = result.current.filter((row) => row.type === 'token') as Array<{
        type: 'token'
        token: TokenWithLogo
      }>
      expect(tokenRows[0].token).toBe(token1)
      expect(tokenRows[1].token).toBe(token2)
      expect(tokenRows[2].token).toBe(token3)
    })

    it('should handle empty matched tokens array', () => {
      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
        }),
      )

      const tokenRows = result.current.filter((row) => row.type === 'token')
      expect(tokenRows.length).toBe(0)
      expect(result.current[0]).toEqual({ type: 'banner' })
    })
  })

  describe('Active List Tokens', () => {
    it('should add active list tokens after matched tokens', () => {
      const matchedToken = createToken('MATCHED', 1, 'Matched Token')
      const activeToken = createToken('ACTIVE', 2, 'Active Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [matchedToken],
          activeList: [activeToken],
        }),
      )

      expect(result.current[0]).toEqual({ type: 'banner' })
      expect(result.current[1]).toEqual({
        type: 'token',
        token: matchedToken,
        disabled: false,
        disabledReason: undefined,
      })
      expect(result.current[2]).toEqual({
        type: 'token',
        token: activeToken,
        disabled: false,
        disabledReason: undefined,
      })
    })

    it('should have correct structure for active list tokens', () => {
      const activeToken = createToken('ACTIVE', 1, 'Active Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [activeToken],
        }),
      )

      const tokenRow = result.current.find((row) => row.type === 'token')
      expect(tokenRow).toEqual({ type: 'token', token: activeToken, disabled: false, disabledReason: undefined })
    })

    it('should handle empty active list', () => {
      const matchedToken = createToken('MATCHED', 1, 'Matched Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [matchedToken],
          activeList: [],
        }),
      )

      const tokenRows = result.current.filter((row) => row.type === 'token')
      expect(tokenRows.length).toBe(1)
      expect((tokenRows[0] as { type: 'token'; token: TokenWithLogo }).token).toBe(matchedToken)
    })
  })

  describe('Blockchain Import Section', () => {
    it('should add blockchain tokens when provided', () => {
      const blockchainToken = createToken('BLOCKCHAIN', 1, 'Blockchain Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: [blockchainToken],
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token') as Array<{
        type: 'import-token'
        token: TokenWithLogo
        section: string
        shadowed?: boolean
        wrapperId?: string
      }>

      expect(importRows.length).toBe(1)
      expect(importRows[0].token).toBe(blockchainToken)
      expect(importRows[0].section).toBe('blockchain')
    })

    it('should not add section title for blockchain section', () => {
      const blockchainToken = createToken('BLOCKCHAIN', 1, 'Blockchain Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: [blockchainToken],
        }),
      )

      const sectionTitles = result.current.filter((row) => row.type === 'section-title')
      expect(sectionTitles.length).toBe(0)
    })

    it('should have shadowed false for blockchain tokens', () => {
      const blockchainToken = createToken('BLOCKCHAIN', 1, 'Blockchain Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: [blockchainToken],
        }),
      )

      const importRow = result.current.find((row) => row.type === 'import-token') as {
        type: 'import-token'
        shadowed?: boolean
      }

      expect(importRow.shadowed).toBe(false)
    })

    it('should have wrapperId currency-import on first blockchain token', () => {
      const blockchainToken = createToken('BLOCKCHAIN', 1, 'Blockchain Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: [blockchainToken],
        }),
      )

      const importRow = result.current.find((row) => row.type === 'import-token') as {
        type: 'import-token'
        wrapperId?: string
      }

      expect(importRow.wrapperId).toBe('currency-import')
    })

    it('should respect SEARCH_RESULTS_LIMIT for blockchain tokens', () => {
      const blockchainTokens = createTokens(150)

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: blockchainTokens,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token')
      expect(importRows.length).toBe(100)
    })
  })

  describe('Inactive Lists Import Section', () => {
    it('should add section title for inactive lists', () => {
      const inactiveToken = createToken('INACTIVE', 1, 'Inactive Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          inactiveListsResult: [inactiveToken],
        }),
      )

      const sectionTitle = result.current.find((row) => row.type === 'section-title') as {
        type: 'section-title'
        text: string
        tooltip?: string
      }

      expect(sectionTitle).toBeDefined()
      expect(sectionTitle.text).toBe('Expanded results from inactive Token Lists')
    })

    it('should include tooltip text for inactive lists', () => {
      const inactiveToken = createToken('INACTIVE', 1, 'Inactive Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          inactiveListsResult: [inactiveToken],
        }),
      )

      const sectionTitle = result.current.find((row) => row.type === 'section-title') as {
        type: 'section-title'
        tooltip?: string
      }

      expect(sectionTitle.tooltip).toBe(
        'Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.',
      )
    })

    it('should have shadowed true for inactive tokens', () => {
      const inactiveToken = createToken('INACTIVE', 1, 'Inactive Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          inactiveListsResult: [inactiveToken],
        }),
      )

      const importRow = result.current.find((row) => row.type === 'import-token') as {
        type: 'import-token'
        shadowed?: boolean
      }

      expect(importRow.shadowed).toBe(true)
    })

    it('should have correct section type inactive', () => {
      const inactiveToken = createToken('INACTIVE', 1, 'Inactive Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          inactiveListsResult: [inactiveToken],
        }),
      )

      const importRow = result.current.find((row) => row.type === 'import-token') as {
        type: 'import-token'
        section: string
      }

      expect(importRow.section).toBe('inactive')
    })

    it('should respect limit for inactive tokens', () => {
      const inactiveTokens = createTokens(150)

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          inactiveListsResult: inactiveTokens,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token')
      expect(importRows.length).toBe(100)
    })
  })

  describe('External API Import Section', () => {
    it('should add section title for external API results', () => {
      const externalToken = createToken('EXTERNAL', 1, 'External Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          externalApiResult: [externalToken],
        }),
      )

      const sectionTitle = result.current.find((row) => row.type === 'section-title') as {
        type: 'section-title'
        text: string
      }

      expect(sectionTitle).toBeDefined()
      expect(sectionTitle.text).toBe('Additional Results from External Sources')
    })

    it('should include tooltip text for external API results', () => {
      const externalToken = createToken('EXTERNAL', 1, 'External Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          externalApiResult: [externalToken],
        }),
      )

      const sectionTitle = result.current.find((row) => row.type === 'section-title') as {
        type: 'section-title'
        tooltip?: string
      }

      expect(sectionTitle.tooltip).toBe('Tokens from external sources.')
    })

    it('should have shadowed true for external tokens', () => {
      const externalToken = createToken('EXTERNAL', 1, 'External Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          externalApiResult: [externalToken],
        }),
      )

      const importRow = result.current.find((row) => row.type === 'import-token') as {
        type: 'import-token'
        shadowed?: boolean
      }

      expect(importRow.shadowed).toBe(true)
    })

    it('should have correct section type external', () => {
      const externalToken = createToken('EXTERNAL', 1, 'External Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          externalApiResult: [externalToken],
        }),
      )

      const importRow = result.current.find((row) => row.type === 'import-token') as {
        type: 'import-token'
        section: string
      }

      expect(importRow.section).toBe('external')
    })

    it('should respect limit for external tokens', () => {
      const externalTokens = createTokens(150)

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          externalApiResult: externalTokens,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token')
      expect(importRows.length).toBe(100)
    })
  })

  describe('Import Section Structure', () => {
    it('should have isFirstInSection true on first token', () => {
      const tokens = [createToken('TOKEN1', 1, 'Token 1'), createToken('TOKEN2', 2, 'Token 2')]

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: tokens,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token') as Array<{
        type: 'import-token'
        isFirstInSection: boolean
      }>

      expect(importRows[0].isFirstInSection).toBe(true)
      expect(importRows[1].isFirstInSection).toBe(false)
    })

    it('should have isLastInSection true on last token', () => {
      const tokens = [createToken('TOKEN1', 1, 'Token 1'), createToken('TOKEN2', 2, 'Token 2')]

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: tokens,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token') as Array<{
        type: 'import-token'
        isLastInSection: boolean
      }>

      expect(importRows[0].isLastInSection).toBe(false)
      expect(importRows[1].isLastInSection).toBe(true)
    })

    it('should have both flags false on middle tokens', () => {
      const tokens = [
        createToken('TOKEN1', 1, 'Token 1'),
        createToken('TOKEN2', 2, 'Token 2'),
        createToken('TOKEN3', 3, 'Token 3'),
      ]

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: tokens,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token') as Array<{
        type: 'import-token'
        isFirstInSection: boolean
        isLastInSection: boolean
      }>

      expect(importRows[1].isFirstInSection).toBe(false)
      expect(importRows[1].isLastInSection).toBe(false)
    })

    it('should have wrapperId only on first token', () => {
      const tokens = [createToken('TOKEN1', 1, 'Token 1'), createToken('TOKEN2', 2, 'Token 2')]

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: tokens,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token') as Array<{
        type: 'import-token'
        wrapperId?: string
      }>

      expect(importRows[0].wrapperId).toBe('currency-import')
      expect(importRows[1].wrapperId).toBeUndefined()
    })

    it('should have correct section type on each import token', () => {
      const blockchainToken = createToken('BLOCKCHAIN', 1, 'Blockchain Token')
      const inactiveToken = createToken('INACTIVE', 2, 'Inactive Token')
      const externalToken = createToken('EXTERNAL', 3, 'External Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: [blockchainToken],
          inactiveListsResult: [inactiveToken],
          externalApiResult: [externalToken],
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token') as Array<{
        type: 'import-token'
        section: string
      }>

      expect(importRows.find((row) => row.section === 'blockchain')).toBeDefined()
      expect(importRows.find((row) => row.section === 'inactive')).toBeDefined()
      expect(importRows.find((row) => row.section === 'external')).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined token arrays by skipping section', () => {
      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: undefined,
          inactiveListsResult: undefined,
          externalApiResult: undefined,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token')
      expect(importRows.length).toBe(0)
      expect(result.current).toEqual([{ type: 'banner' }])
    })

    it('should handle empty token arrays by skipping section', () => {
      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: [],
          inactiveListsResult: [],
          externalApiResult: [],
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token')
      expect(importRows.length).toBe(0)
      expect(result.current).toEqual([{ type: 'banner' }])
    })

    it('should handle arrays exceeding limit by truncating to 100', () => {
      const largeArray = createTokens(200)

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: largeArray,
        }),
      )

      const importRows = result.current.filter((row) => row.type === 'import-token')
      expect(importRows.length).toBe(100)
    })

    it('should handle single token in section with both first and last flags true', () => {
      const singleToken = createToken('SINGLE', 1, 'Single Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [],
          blockchainResult: [singleToken],
        }),
      )

      const importRow = result.current.find((row) => row.type === 'import-token') as {
        type: 'import-token'
        isFirstInSection: boolean
        isLastInSection: boolean
      }

      expect(importRow.isFirstInSection).toBe(true)
      expect(importRow.isLastInSection).toBe(true)
    })
  })

  describe('Bridge Mode Disabled State', () => {
    it('should not disable tokens when not in bridge mode', () => {
      const token = createToken('TOKEN', 1, 'Test Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [token],
          activeList: [],
          areTokensFromBridge: false,
          bridgeSupportedTokensMap: null,
        }),
      )

      const tokenRow = result.current.find((row) => row.type === 'token') as {
        type: 'token'
        disabled?: boolean
      }

      expect(tokenRow.disabled).toBe(false)
    })

    it('should not disable tokens when bridge map is loading (null)', () => {
      const token = createToken('TOKEN', 1, 'Test Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [token],
          activeList: [],
          areTokensFromBridge: true,
          bridgeSupportedTokensMap: null,
        }),
      )

      const tokenRow = result.current.find((row) => row.type === 'token') as {
        type: 'token'
        disabled?: boolean
      }

      expect(tokenRow.disabled).toBe(false)
    })

    it('should disable matched tokens not in bridge map', () => {
      const token = createToken('TOKEN', 1, 'Test Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [token],
          activeList: [],
          areTokensFromBridge: true,
          bridgeSupportedTokensMap: { '0xother': true },
        }),
      )

      const tokenRow = result.current.find((row) => row.type === 'token') as {
        type: 'token'
        disabled?: boolean
        disabledReason?: string
      }

      expect(tokenRow.disabled).toBe(true)
      expect(tokenRow.disabledReason).toBeDefined()
    })

    it('should disable active list tokens not in bridge map', () => {
      const token = createToken('TOKEN', 1, 'Test Token')

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [],
          activeList: [token],
          areTokensFromBridge: true,
          bridgeSupportedTokensMap: { '0xother': true },
        }),
      )

      const tokenRow = result.current.find((row) => row.type === 'token') as {
        type: 'token'
        disabled?: boolean
        disabledReason?: string
      }

      expect(tokenRow.disabled).toBe(true)
      expect(tokenRow.disabledReason).toBeDefined()
    })

    it('should not disable tokens that are in bridge map', () => {
      const token = createToken('TOKEN', 1, 'Test Token')
      const tokenAddress = toAddress(1)

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [token],
          activeList: [],
          areTokensFromBridge: true,
          bridgeSupportedTokensMap: { [tokenAddress]: true },
        }),
      )

      const tokenRow = result.current.find((row) => row.type === 'token') as {
        type: 'token'
        disabled?: boolean
        disabledReason?: string
      }

      expect(tokenRow.disabled).toBe(false)
      expect(tokenRow.disabledReason).toBeUndefined()
    })

    it('should handle mixed bridgeable and non-bridgeable tokens', () => {
      const nonBridgeableToken = createToken('NON_BRIDGE', 1, 'Non-Bridgeable Token')
      const bridgeableToken = createToken('BRIDGE', 2, 'Bridgeable Token')
      const bridgeableAddress = toAddress(2)

      const { result } = renderHook(() =>
        useSearchRows({
          isLoading: false,
          matchedTokens: [nonBridgeableToken, bridgeableToken],
          activeList: [],
          areTokensFromBridge: true,
          bridgeSupportedTokensMap: { [bridgeableAddress]: true },
        }),
      )

      const tokenRows = result.current.filter((row) => row.type === 'token') as Array<{
        type: 'token'
        token: TokenWithLogo
        disabled?: boolean
      }>

      // Non-bridgeable token should be disabled
      const nonBridgeableRow = tokenRows.find((row) => row.token.symbol === 'NON_BRIDGE')
      expect(nonBridgeableRow?.disabled).toBe(true)

      // Bridgeable token should not be disabled
      const bridgeableRow = tokenRows.find((row) => row.token.symbol === 'BRIDGE')
      expect(bridgeableRow?.disabled).toBe(false)
    })
  })

  describe('Memoization', () => {
    it('should return same reference when dependencies do not change', () => {
      const matchedTokens = [createToken('TOKEN1', 1, 'Token 1')]
      const activeList = [createToken('TOKEN2', 2, 'Token 2')]

      const { result, rerender } = renderHook(
        ({ matchedTokens, activeList }) =>
          useSearchRows({
            isLoading: false,
            matchedTokens,
            activeList,
          }),
        {
          initialProps: { matchedTokens, activeList },
        },
      )

      const firstResult = result.current

      rerender({ matchedTokens, activeList })

      expect(result.current).toBe(firstResult)
    })

    it('should return new reference when dependencies change', () => {
      const matchedTokens1 = [createToken('TOKEN1', 1, 'Token 1')]
      const matchedTokens2 = [createToken('TOKEN2', 2, 'Token 2')]
      const activeList = [createToken('TOKEN3', 3, 'Token 3')]

      const { result, rerender } = renderHook(
        ({ matchedTokens, activeList }) =>
          useSearchRows({
            isLoading: false,
            matchedTokens,
            activeList,
          }),
        {
          initialProps: { matchedTokens: matchedTokens1, activeList },
        },
      )

      const firstResult = result.current

      rerender({ matchedTokens: matchedTokens2, activeList })

      expect(result.current).not.toBe(firstResult)
      expect(result.current.length).toBe(firstResult.length)
    })

    it('should return new reference when isLoading changes', () => {
      const matchedTokens = [createToken('TOKEN1', 1, 'Token 1')]
      const activeList = [createToken('TOKEN2', 2, 'Token 2')]

      const { result, rerender } = renderHook(
        ({ isLoading, matchedTokens, activeList }) =>
          useSearchRows({
            isLoading,
            matchedTokens,
            activeList,
          }),
        {
          initialProps: { isLoading: false, matchedTokens, activeList },
        },
      )

      const firstResult = result.current

      rerender({ isLoading: true, matchedTokens, activeList })

      expect(result.current).not.toBe(firstResult)
      expect(result.current.length).toBe(0)
    })
  })
})
