import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useBridgeSupportedTokens } from 'entities/bridgeProvider'

import { useSelectTokenWidgetState } from 'modules/tokensList'

import { useBridgeCustomTokensForChain } from './useBridgeCustomTokensForChain'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../../tokensList/state/selectTokenWidgetAtom'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))

jest.mock('entities/bridgeProvider', () => ({
  ...jest.requireActual('entities/bridgeProvider'),
  useBridgeSupportedTokens: jest.fn(),
}))

jest.mock('modules/tokensList', () => ({
  ...jest.requireActual('modules/tokensList'),
  useSelectTokenWidgetState: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseBridgeSupportedTokens = useBridgeSupportedTokens as jest.MockedFunction<typeof useBridgeSupportedTokens>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>

const BASE_VELORA = '0x4e107a0000db66f0e9fd2039288bf811dd1f9c74'
const BASE_USDC = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
const ARBITRUM_USDC = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

const veloraOnBase = {
  address: BASE_VELORA,
  chainId: SupportedChainId.BASE,
  decimals: 18,
  symbol: 'VLR',
  name: 'Velora',
} as TokenWithLogo

const usdcOnBase = {
  address: BASE_USDC,
  chainId: SupportedChainId.BASE,
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
} as TokenWithLogo

const usdcOnArbitrum = {
  address: ARBITRUM_USDC,
  chainId: SupportedChainId.ARBITRUM_ONE,
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
} as TokenWithLogo

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
type BridgeResult = ReturnType<typeof useBridgeSupportedTokens>

function createWidgetState(override: Partial<typeof DEFAULT_SELECT_TOKEN_WIDGET_STATE>): WidgetState {
  return { ...DEFAULT_SELECT_TOKEN_WIDGET_STATE, ...override } as WidgetState
}

function bridgeResult(tokens: TokenWithLogo[]): BridgeResult {
  return {
    data: { tokens, isRouteAvailable: tokens.length > 0 },
    isLoading: false,
  } as BridgeResult
}

describe('useBridgeCustomTokensForChain', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: false }))
    mockUseBridgeSupportedTokens.mockReturnValue(bridgeResult([]))
  })

  it('does not fire the bridge SDK when the token selector is closed', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: false }))
    mockUseBridgeSupportedTokens.mockReturnValue(bridgeResult([]))

    const { result } = renderHook(() => useBridgeCustomTokensForChain(SupportedChainId.BASE))

    expect(mockUseBridgeSupportedTokens).toHaveBeenCalledWith(undefined)
    expect(result.current).toEqual([])
  })

  it('returns an empty array when the queried chainId equals the sell chain', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true }))
    mockUseBridgeSupportedTokens.mockReturnValue(bridgeResult([veloraOnBase]))

    const { result } = renderHook(() => useBridgeCustomTokensForChain(SupportedChainId.MAINNET))

    expect(mockUseBridgeSupportedTokens).toHaveBeenCalledWith(undefined)
    expect(result.current).toEqual([])
  })

  it('returns an empty array when the bridge SDK has no tokens', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true }))
    mockUseBridgeSupportedTokens.mockReturnValue(bridgeResult([]))

    const { result } = renderHook(() => useBridgeCustomTokensForChain(SupportedChainId.BASE))

    expect(mockUseBridgeSupportedTokens).toHaveBeenCalledWith({
      buyChainId: SupportedChainId.BASE,
      sellChainId: SupportedChainId.MAINNET,
    })
    expect(result.current).toEqual([])
  })

  it('returns normalized addresses of bridge tokens for the queried chainId', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true }))
    mockUseBridgeSupportedTokens.mockReturnValue(bridgeResult([veloraOnBase, usdcOnBase]))

    const { result } = renderHook(() => useBridgeCustomTokensForChain(SupportedChainId.BASE))

    expect(result.current).toEqual([getAddressKey(BASE_VELORA), getAddressKey(BASE_USDC)])
  })

  it('filters out tokens whose chainId does not match the queried chainId', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true }))
    mockUseBridgeSupportedTokens.mockReturnValue(bridgeResult([veloraOnBase, usdcOnArbitrum]))

    const { result } = renderHook(() => useBridgeCustomTokensForChain(SupportedChainId.BASE))

    expect(result.current).toEqual([getAddressKey(BASE_VELORA)])
  })

  it('uses oppositeToken.chainId as sellChainId when present', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true, oppositeToken: usdcOnArbitrum }))
    mockUseBridgeSupportedTokens.mockReturnValue(bridgeResult([veloraOnBase]))

    renderHook(() => useBridgeCustomTokensForChain(SupportedChainId.BASE))

    expect(mockUseBridgeSupportedTokens).toHaveBeenCalledWith({
      buyChainId: SupportedChainId.BASE,
      sellChainId: SupportedChainId.ARBITRUM_ONE,
    })
  })

  it('falls back to walletChainId when oppositeToken is absent', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true }))
    mockUseBridgeSupportedTokens.mockReturnValue(bridgeResult([veloraOnBase]))

    renderHook(() => useBridgeCustomTokensForChain(SupportedChainId.BASE))

    expect(mockUseBridgeSupportedTokens).toHaveBeenCalledWith({
      buyChainId: SupportedChainId.BASE,
      sellChainId: SupportedChainId.MAINNET,
    })
  })

  it('returns a stable empty-array reference while the gate stays closed', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: false }))

    const { result, rerender } = renderHook(() => useBridgeCustomTokensForChain(SupportedChainId.BASE))
    const first = result.current

    rerender()
    rerender()

    expect(result.current).toBe(first)
  })
})
