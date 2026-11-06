import { useAtomValue } from 'jotai'

import { areBalancesLoadedAtom, BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useFavoriteTokens } from '@cowprotocol/tokens'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useBridgeSupportedTokens } from 'entities/bridgeProvider'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { Field } from 'legacy/state/types'

import { useTokensBalancesCombined } from 'modules/combinedBalances'

import { useChainsToSelect } from './useChainsToSelect'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useTokensToSelect } from './useTokensToSelect'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('@cowprotocol/balances-and-allowances', () => ({
  areBalancesLoadedAtom: Symbol('areBalancesLoadedAtom'),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('@cowprotocol/tokens', () => ({
  useFavoriteTokens: jest.fn(),
}))

jest.mock('entities/bridgeProvider', () => ({
  useBridgeSupportedTokens: jest.fn(),
}))

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

jest.mock('modules/combinedBalances', () => ({
  useTokensBalancesCombined: jest.fn(),
}))

jest.mock('./useSelectTokenWidgetState', () => ({
  useSelectTokenWidgetState: jest.fn(),
}))

jest.mock('./useChainsToSelect', () => ({
  useChainsToSelect: jest.fn(),
}))

jest.mock('../state/tokensToSelectAtom', () => ({
  tokensToSelectAtom: Symbol('tokensToSelectAtom'),
}))

const mockUseAtomValue = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseFavoriteTokens = useFavoriteTokens as jest.MockedFunction<typeof useFavoriteTokens>
const mockUseBridgeSupportedTokens = useBridgeSupportedTokens as jest.MockedFunction<typeof useBridgeSupportedTokens>
const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>
const mockUseChainsToSelect = useChainsToSelect as jest.MockedFunction<typeof useChainsToSelect>
const mockUseTokensBalancesCombined = useTokensBalancesCombined as jest.MockedFunction<typeof useTokensBalancesCombined>

const ACCOUNT = '0x4444444444444444444444444444444444444444'

const mainnetToken = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chainId: SupportedChainId.MAINNET,
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
} as TokenWithLogo

const lineaToken = {
  address: '0x176211869ca2b568f2a7d4ee941e073a821ee1ff',
  chainId: SupportedChainId.LINEA,
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
} as TokenWithLogo

const scopedFavoriteToken = {
  address: '0x1111111111111111111111111111111111111111',
  chainId: SupportedChainId.MAINNET,
  decimals: 18,
  symbol: 'AAPLx',
  name: 'Scoped Favorite',
} as TokenWithLogo

const leakedFavoriteToken = {
  address: '0x2222222222222222222222222222222222222222',
  chainId: SupportedChainId.MAINNET,
  decimals: 18,
  symbol: 'COW',
  name: 'Leaked Favorite',
} as TokenWithLogo

const DEFAULT_SELECT_TOKEN_WIDGET_STATE = {
  open: false,
  field: undefined,
  selectedToken: undefined,
  onSelectToken: undefined,
  tokenToImport: undefined,
  listToImport: undefined,
  listToToggle: undefined,
  selectedPoolAddress: undefined,
  selectedTargetChainId: undefined,
  tradeType: undefined,
  forceOpen: false,
  standalone: false,
  displayLpTokenLists: false,
} as const

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
const createWidgetState = (override: Partial<WidgetState>): WidgetState => {
  return {
    ...DEFAULT_SELECT_TOKEN_WIDGET_STATE,
    ...override,
  } as WidgetState
}

function createBalancesState(values: BalancesState['values']): BalancesState {
  return {
    values,
    hasFirstLoad: true,
    isLoading: false,
    chainId: SupportedChainId.MAINNET,
    fromCache: false,
    error: null,
  }
}

function mockAtomValues(listTokens: TokenWithLogo[], areBalancesLoaded = true): void {
  mockUseAtomValue.mockImplementation(((atom: unknown) =>
    atom === areBalancesLoadedAtom ? areBalancesLoaded : listTokens) as typeof useAtomValue)
}

describe('useTokensToSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockAtomValues([mainnetToken])
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseFavoriteTokens.mockReturnValue([])
    mockUseInjectedWidgetParams.mockReturnValue({})
    mockUseBridgeSupportedTokens.mockReturnValue({
      data: { tokens: [lineaToken], isRouteAvailable: true },
      isLoading: false,
    } as ReturnType<typeof useBridgeSupportedTokens>)
    mockUseChainsToSelect.mockReturnValue(undefined)
    mockUseTokensBalancesCombined.mockReturnValue(createBalancesState({}))
  })

  it('uses resolved default chain from chain selector state in bridge mode', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )
    mockUseChainsToSelect.mockReturnValue({
      defaultChainId: SupportedChainId.LINEA,
      chains: [],
      isLoading: false,
    })

    const { result } = renderHook(() => useTokensToSelect())

    expect(mockUseBridgeSupportedTokens).toHaveBeenCalledWith({
      buyChainId: SupportedChainId.LINEA,
      sellChainId: SupportedChainId.MAINNET,
    })
    expect(result.current.areTokensFromBridge).toBe(true)
    expect(result.current.tokens).toEqual([lineaToken])
    expect(result.current.allowedRecentTokens).toBeUndefined()
  })

  it('passes sellChainId/buyChainId when selecting output token on a different chain', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        selectedTargetChainId: SupportedChainId.MAINNET,
        oppositeToken: mainnetToken,
      }),
    )
    mockUseChainsToSelect.mockReturnValue({
      defaultChainId: SupportedChainId.LINEA,
      chains: [],
      isLoading: false,
    })

    renderHook(() => useTokensToSelect())

    expect(mockUseBridgeSupportedTokens).toHaveBeenCalledWith({
      buyChainId: SupportedChainId.LINEA,
      sellChainId: SupportedChainId.MAINNET,
    })
  })

  it('uses oppositeToken chainId as sellChainId when wallet network differs from trade network', () => {
    const arbitrumToken = { ...mainnetToken, chainId: SupportedChainId.ARBITRUM_ONE } as TokenWithLogo

    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        selectedTargetChainId: SupportedChainId.MAINNET,
        oppositeToken: arbitrumToken, // sell token on Arbitrum, wallet on Mainnet
      }),
    )
    mockUseChainsToSelect.mockReturnValue(undefined)

    renderHook(() => useTokensToSelect())

    expect(mockUseBridgeSupportedTokens).toHaveBeenCalledWith({
      buyChainId: SupportedChainId.MAINNET,
      sellChainId: SupportedChainId.ARBITRUM_ONE,
    })
  })

  it('filters favorite tokens to the currently selectable token set', () => {
    mockAtomValues([scopedFavoriteToken])
    mockUseFavoriteTokens.mockReturnValue([scopedFavoriteToken, leakedFavoriteToken])
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.INPUT,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useTokensToSelect())

    expect(result.current.tokens).toEqual([scopedFavoriteToken])
    expect(result.current.favoriteTokens).toEqual([scopedFavoriteToken])
  })

  it.each([
    ['sellTokenLists', Field.INPUT, { sellTokenLists: ['https://example.com/sell.json'] }, true],
    ['buyTokenLists', Field.OUTPUT, { buyTokenLists: ['https://example.com/buy.json'] }, true],
    ['shared tokenLists input', Field.INPUT, { tokenLists: ['https://example.com/shared.json'] }, true],
    ['shared tokenLists output', Field.OUTPUT, { tokenLists: ['https://example.com/shared.json'] }, true],
    ['buyTokenLists on input', Field.INPUT, { buyTokenLists: ['https://example.com/buy.json'] }, false],
    ['sellTokenLists on output', Field.OUTPUT, { sellTokenLists: ['https://example.com/sell.json'] }, false],
  ])('applies the expected recent-token scope for %s', (_label, field, widgetParams, isRestricted) => {
    mockAtomValues([scopedFavoriteToken])
    mockUseInjectedWidgetParams.mockReturnValue(widgetParams)
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )

    const { result } = renderHook(() => useTokensToSelect())

    expect(result.current.hasScopedListRestriction).toBe(isRestricted)
    expect(result.current.allowedRecentTokens).toEqual(isRestricted ? [scopedFavoriteToken] : undefined)
  })

  it('filters bridge favorites to the field-scoped selectable token set', () => {
    const scopedBridgeFavorite = { ...scopedFavoriteToken, chainId: SupportedChainId.LINEA } as TokenWithLogo
    const scopedUnsupportedRecent = {
      address: '0x3333333333333333333333333333333333333333',
      chainId: SupportedChainId.LINEA,
      decimals: 18,
      symbol: 'RECENT',
      name: 'Scoped unsupported recent',
    } as TokenWithLogo
    const leakedBridgeFavorite = { ...leakedFavoriteToken, chainId: SupportedChainId.LINEA } as TokenWithLogo

    mockAtomValues([scopedBridgeFavorite, scopedUnsupportedRecent])
    mockUseFavoriteTokens.mockReturnValue([scopedBridgeFavorite, leakedBridgeFavorite])
    mockUseInjectedWidgetParams.mockReturnValue({ buyTokenLists: ['https://example.com/buy.json'] })
    mockUseBridgeSupportedTokens.mockReturnValue({
      data: { tokens: [scopedBridgeFavorite, leakedBridgeFavorite], isRouteAvailable: true },
      isLoading: false,
    } as ReturnType<typeof useBridgeSupportedTokens>)
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.OUTPUT,
        selectedTargetChainId: SupportedChainId.LINEA,
        oppositeToken: mainnetToken,
      }),
    )

    const { result } = renderHook(() => useTokensToSelect())

    expect(result.current.tokens).toEqual([scopedBridgeFavorite, leakedBridgeFavorite])
    expect(result.current.favoriteTokens).toEqual([scopedBridgeFavorite])
    expect(result.current.allowedRecentTokens).toEqual([scopedBridgeFavorite, scopedUnsupportedRecent])
  })

  describe('tokens filters', () => {
    beforeEach(() => {
      mockAtomValues([mainnetToken, scopedFavoriteToken, leakedFavoriteToken])
      mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET, account: ACCOUNT } as WalletInfo)
      mockUseTokensBalancesCombined.mockReturnValue(
        createBalancesState({
          [getAddressKey(mainnetToken.address)]: 5n,
          [getAddressKey(scopedFavoriteToken.address)]: 1n,
        }),
      )
    })

    it('keeps the given tokens held by the wallet in the sell selector', () => {
      mockUseInjectedWidgetParams.mockReturnValue({
        sellTokensFilter: { tokens: [scopedFavoriteToken.address, leakedFavoriteToken.address], onlyWithBalance: true },
      })
      mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ field: Field.INPUT }))

      const { result } = renderHook(() => useTokensToSelect())

      expect(result.current.tokens).toEqual([scopedFavoriteToken])
      expect(result.current.hasScopedListRestriction).toBe(true)
      expect(result.current.allowedRecentTokens).toEqual([scopedFavoriteToken])
    })

    it('does not apply the sell filter to the buy selector', () => {
      mockUseInjectedWidgetParams.mockReturnValue({ sellTokensFilter: { onlyWithBalance: true } })
      mockUseSelectTokenWidgetState.mockReturnValue(
        createWidgetState({ field: Field.OUTPUT, selectedTargetChainId: SupportedChainId.MAINNET }),
      )

      const { result } = renderHook(() => useTokensToSelect())

      expect(result.current.tokens).toEqual([mainnetToken, scopedFavoriteToken, leakedFavoriteToken])
      expect(result.current.hasScopedListRestriction).toBe(false)
    })

    it('ignores the balances without a wallet', () => {
      mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
      mockUseInjectedWidgetParams.mockReturnValue({ sellTokensFilter: { onlyWithBalance: true } })
      mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ field: Field.INPUT }))

      const { result } = renderHook(() => useTokensToSelect())

      expect(result.current.tokens).toEqual([mainnetToken, scopedFavoriteToken, leakedFavoriteToken])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.hasScopedListRestriction).toBe(false)
      expect(result.current.allowedRecentTokens).toBeUndefined()
    })

    it('is loading until the balances are loaded', () => {
      mockAtomValues([], false)
      mockUseInjectedWidgetParams.mockReturnValue({ sellTokensFilter: { onlyWithBalance: true } })
      mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ field: Field.INPUT }))

      const { result } = renderHook(() => useTokensToSelect())

      expect(result.current.isLoading).toBe(true)
    })

    it('narrows bridge tokens to the given tokens only', () => {
      const bridgeToken = { ...leakedFavoriteToken, chainId: SupportedChainId.LINEA } as TokenWithLogo

      mockUseInjectedWidgetParams.mockReturnValue({
        buyTokensFilter: { tokens: [lineaToken.address, bridgeToken.address], onlyWithBalance: true },
      })
      mockUseSelectTokenWidgetState.mockReturnValue(
        createWidgetState({ field: Field.OUTPUT, selectedTargetChainId: SupportedChainId.LINEA }),
      )

      const { result } = renderHook(() => useTokensToSelect())

      expect(result.current.tokens).toEqual([lineaToken])
    })
  })
})
