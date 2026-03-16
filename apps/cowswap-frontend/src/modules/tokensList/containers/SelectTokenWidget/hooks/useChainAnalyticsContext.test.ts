import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { Field } from 'legacy/state/types'

import { useChainAnalyticsContext } from './useChainAnalyticsContext'

import { useChainsToSelect } from '../../../hooks/useChainsToSelect'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../../../state/selectTokenWidgetAtom'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))

jest.mock('../../../hooks/useSelectTokenWidgetState', () => ({
  useSelectTokenWidgetState: jest.fn(),
}))

jest.mock('../../../hooks/useChainsToSelect', () => ({
  useChainsToSelect: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>
const mockUseChainsToSelect = useChainsToSelect as jest.MockedFunction<typeof useChainsToSelect>

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
const createWidgetState = (override: Partial<typeof DEFAULT_SELECT_TOKEN_WIDGET_STATE>): WidgetState => {
  return {
    ...DEFAULT_SELECT_TOKEN_WIDGET_STATE,
    ...override,
  } as WidgetState
}

describe('useChainAnalyticsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseChainsToSelect.mockReturnValue(undefined)
  })

  it('uses resolved target chain for input field analytics context', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        field: Field.INPUT,
        selectedTargetChainId: SupportedChainId.MAINNET,
      }),
    )
    mockUseChainsToSelect.mockReturnValue({
      defaultChainId: SupportedChainId.LINEA,
      chains: [],
      isLoading: false,
    })

    const { result } = renderHook(() => useChainAnalyticsContext())

    expect(result.current.counterChainId).toBe(SupportedChainId.LINEA)
  })
})
