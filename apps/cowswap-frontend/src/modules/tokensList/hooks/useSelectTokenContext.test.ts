import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'
import { useBalancesAccountForChain } from 'entities/balancesContext/useBalancesAccountForChain'

import { useSelectTokenContext } from './useSelectTokenContext'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useSourceChainId } from './useSourceChainId'

import { useTokenDataSources } from '../containers/SelectTokenWidget/hooks/useTokenDataSources'
import { useTokenSelectionHandler } from '../containers/SelectTokenWidget/hooks/useTokenSelectionHandler'
import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'

jest.mock('entities/balancesContext/useBalancesAccountForChain', () => ({
  useBalancesAccountForChain: jest.fn(),
}))

jest.mock('./useSelectTokenWidgetState', () => ({
  ...jest.requireActual('./useSelectTokenWidgetState'),
  useSelectTokenWidgetState: jest.fn(),
}))

jest.mock('./useSourceChainId', () => ({
  useSourceChainId: jest.fn(),
}))

jest.mock('../containers/SelectTokenWidget/hooks/useTokenDataSources', () => ({
  useTokenDataSources: jest.fn(),
}))

jest.mock('../containers/SelectTokenWidget/hooks/useTokenSelectionHandler', () => ({
  useTokenSelectionHandler: jest.fn(),
}))

const mockUseBalancesAccountForChain = useBalancesAccountForChain as jest.MockedFunction<
  typeof useBalancesAccountForChain
>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>
const mockUseSourceChainId = useSourceChainId as jest.MockedFunction<typeof useSourceChainId>
const mockUseTokenDataSources = useTokenDataSources as jest.MockedFunction<typeof useTokenDataSources>
const mockUseTokenSelectionHandler = useTokenSelectionHandler as jest.MockedFunction<typeof useTokenSelectionHandler>

describe('useSelectTokenContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseBalancesAccountForChain.mockReturnValue('0x0000000000000000000000000000000000000001')
    mockUseSelectTokenWidgetState.mockReturnValue(DEFAULT_SELECT_TOKEN_WIDGET_STATE)
    mockUseTokenDataSources.mockReturnValue({
      userAddedTokens: [],
      allTokenLists: [],
      balancesState: {
        isLoading: false,
        values: {},
        chainId: null,
        fromCache: false,
        hasFirstLoad: false,
        error: null,
      },
      unsupportedTokens: {},
      permitCompatibleTokens: {},
      tokenListTags: {},
    } as ReturnType<typeof useTokenDataSources>)
    mockUseTokenSelectionHandler.mockReturnValue(jest.fn())
  })

  it('is connected when an EVM account exists and the browsed chain is EVM', () => {
    mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.MAINNET, source: 'wallet' })

    const { result } = renderHook(() => useSelectTokenContext())

    expect(mockUseBalancesAccountForChain).toHaveBeenCalledWith(SupportedChainId.MAINNET)
    expect(result.current.isWalletConnected).toBe(true)
  })

  // Regression guard: a Solana account can't be derived from the connected EVM wallet. Reporting
  // "connected" here (because the EVM wallet is connected) would make the token list render a
  // balance skeleton that waits on a fetch that never happens.
  it('is NOT connected when useBalancesAccountForChain resolves no account (e.g. browsing Solana without a connected Solana account)', () => {
    mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.SOLANA, source: 'selector' })
    mockUseBalancesAccountForChain.mockReturnValue(undefined)

    const { result } = renderHook(() => useSelectTokenContext())

    expect(result.current.isWalletConnected).toBe(false)
  })

  it('is connected when useBalancesAccountForChain resolves an account (e.g. a real connected Solana account)', () => {
    mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.SOLANA, source: 'wallet' })
    mockUseBalancesAccountForChain.mockReturnValue('SoLanaPubKey11111111111111111111111111111')

    const { result } = renderHook(() => useSelectTokenContext())

    expect(result.current.isWalletConnected).toBe(true)
  })
})
