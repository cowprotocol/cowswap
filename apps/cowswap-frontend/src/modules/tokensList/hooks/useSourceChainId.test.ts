import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useSourceChainId } from './useSourceChainId'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))

jest.mock('./useSelectTokenWidgetState', () => ({
  useSelectTokenWidgetState: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
const createWidgetState = (override: Partial<typeof DEFAULT_SELECT_TOKEN_WIDGET_STATE>): WidgetState => {
  return {
    ...DEFAULT_SELECT_TOKEN_WIDGET_STATE,
    ...override,
  } as WidgetState
}

describe('useSourceChainId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as WalletInfo)
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: false }))
  })

  it('returns wallet chain when selector is closed', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        open: false,
        field: Field.OUTPUT,
        selectedTargetChainId: SupportedChainId.GNOSIS_CHAIN,
      }),
    )

    const { result } = renderHook(() => useSourceChainId())

    expect(result.current).toEqual({ chainId: SupportedChainId.MAINNET, source: 'wallet' })
  })

  it('uses selector chain for output selection when open on a different chain (for bridging balance fetching)', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        open: true,
        field: Field.OUTPUT,
        selectedTargetChainId: SupportedChainId.GNOSIS_CHAIN,
      }),
    )

    const { result } = renderHook(() => useSourceChainId())

    expect(result.current).toEqual({ chainId: SupportedChainId.GNOSIS_CHAIN, source: 'selector' })
  })

  it('uses selector chain for input selection when open on a supported chain', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        open: true,
        field: Field.INPUT,
        selectedTargetChainId: SupportedChainId.GNOSIS_CHAIN,
      }),
    )

    const { result } = renderHook(() => useSourceChainId())

    expect(result.current).toEqual({ chainId: SupportedChainId.GNOSIS_CHAIN, source: 'selector' })
  })

  it('ignores unsupported chains and falls back to wallet', () => {
    mockUseSelectTokenWidgetState.mockReturnValue(
      createWidgetState({
        open: true,
        field: Field.INPUT,
        selectedTargetChainId: 999,
      }),
    )

    const { result } = renderHook(() => useSourceChainId())

    expect(result.current).toEqual({ chainId: SupportedChainId.MAINNET, source: 'wallet' })
  })
})
