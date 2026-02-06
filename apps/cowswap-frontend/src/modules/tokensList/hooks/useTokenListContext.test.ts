import { TokenWithLogo } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useRecentTokenSection } from '../containers/SelectTokenWidget/hooks/useRecentTokenSection'

import { useChainsToSelect } from './useChainsToSelect'
import { useSelectTokenContext } from './useSelectTokenContext'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useTokenListContext } from './useTokenListContext'
import { useTokensToSelect } from './useTokensToSelect'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isInjectedWidget: jest.fn(),
}))

jest.mock('./useSelectTokenWidgetState', () => ({
  useSelectTokenWidgetState: jest.fn(),
}))

jest.mock('./useChainsToSelect', () => ({
  useChainsToSelect: jest.fn(),
}))

jest.mock('./useTokensToSelect', () => ({
  useTokensToSelect: jest.fn(),
}))

jest.mock('./useSelectTokenContext', () => ({
  useSelectTokenContext: jest.fn(),
}))

jest.mock('../containers/SelectTokenWidget/hooks/useRecentTokenSection', () => ({
  useRecentTokenSection: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockIsInjectedWidget = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>
const mockUseChainsToSelect = useChainsToSelect as jest.MockedFunction<typeof useChainsToSelect>
const mockUseTokensToSelect = useTokensToSelect as jest.MockedFunction<typeof useTokensToSelect>
const mockUseSelectTokenContext = useSelectTokenContext as jest.MockedFunction<typeof useSelectTokenContext>
const mockUseRecentTokenSection = useRecentTokenSection as jest.MockedFunction<typeof useRecentTokenSection>

const mockToken = {
  address: '0x0000000000000000000000000000000000000001',
  chainId: SupportedChainId.LINEA,
  decimals: 18,
  symbol: 'TEST',
  name: 'Test Token',
} as TokenWithLogo

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
const createWidgetState = (override: Partial<typeof DEFAULT_SELECT_TOKEN_WIDGET_STATE>): WidgetState => {
  return {
    ...DEFAULT_SELECT_TOKEN_WIDGET_STATE,
    ...override,
  } as WidgetState
}

describe('useTokenListContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockIsInjectedWidget.mockReturnValue(false)
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )
    mockUseChainsToSelect.mockReturnValue({
      defaultChainId: SupportedChainId.LINEA,
      chains: [],
      isLoading: false,
    })
    mockUseTokensToSelect.mockReturnValue({
      isLoading: false,
      tokens: [mockToken],
      favoriteTokens: [mockToken],
      areTokensFromBridge: true,
      isRouteAvailable: true,
      bridgeSupportedTokensMap: { [mockToken.address.toLowerCase()]: true },
    })
    mockUseSelectTokenContext.mockReturnValue({
      onTokenListItemClick: jest.fn(),
      balancesState: { values: {} },
    } as ReturnType<typeof useSelectTokenContext>)
    mockUseRecentTokenSection.mockReturnValue({
      recentTokens: [],
      handleTokenListItemClick: jest.fn(),
      clearRecentTokens: jest.fn(),
    })
  })

  it('uses resolved default chain for active chain and exposed target chain', () => {
    const { result } = renderHook(() => useTokenListContext())

    expect(mockUseRecentTokenSection).toHaveBeenCalledWith([mockToken], [mockToken], SupportedChainId.LINEA)
    expect(result.current.selectedTargetChainId).toBe(SupportedChainId.LINEA)
  })
})
