import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllActiveTokens, useFavoriteTokens } from '@cowprotocol/tokens'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useBridgeSupportedTokens } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { useChainsToSelect } from './useChainsToSelect'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useTokensToSelect } from './useTokensToSelect'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))

jest.mock('@cowprotocol/tokens', () => ({
  ...jest.requireActual('@cowprotocol/tokens'),
  useAllActiveTokens: jest.fn(),
  useFavoriteTokens: jest.fn(),
}))

jest.mock('entities/bridgeProvider', () => ({
  ...jest.requireActual('entities/bridgeProvider'),
  useBridgeSupportedTokens: jest.fn(),
}))

jest.mock('./useSelectTokenWidgetState', () => ({
  useSelectTokenWidgetState: jest.fn(),
}))

jest.mock('./useChainsToSelect', () => ({
  useChainsToSelect: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseAllActiveTokens = useAllActiveTokens as jest.MockedFunction<typeof useAllActiveTokens>
const mockUseFavoriteTokens = useFavoriteTokens as jest.MockedFunction<typeof useFavoriteTokens>
const mockUseBridgeSupportedTokens = useBridgeSupportedTokens as jest.MockedFunction<typeof useBridgeSupportedTokens>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>
const mockUseChainsToSelect = useChainsToSelect as jest.MockedFunction<typeof useChainsToSelect>

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

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
const createWidgetState = (override: Partial<typeof DEFAULT_SELECT_TOKEN_WIDGET_STATE>): WidgetState => {
  return {
    ...DEFAULT_SELECT_TOKEN_WIDGET_STATE,
    ...override,
  } as WidgetState
}

describe('useTokensToSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseAllActiveTokens.mockReturnValue({ tokens: [mainnetToken] } as ReturnType<typeof useAllActiveTokens>)
    mockUseFavoriteTokens.mockReturnValue([])
    mockUseBridgeSupportedTokens.mockReturnValue({
      data: { tokens: [lineaToken], isRouteAvailable: true },
      isLoading: false,
    } as ReturnType<typeof useBridgeSupportedTokens>)
    mockUseChainsToSelect.mockReturnValue(undefined)
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
})
