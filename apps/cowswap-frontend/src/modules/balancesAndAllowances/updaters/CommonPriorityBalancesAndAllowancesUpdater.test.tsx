import { BalancesWatcherUpdater } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { render } from '@testing-library/react'
import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState, useSourceChainId } from 'modules/tokensList'
import { usePriorityTokenAddresses } from 'modules/trade'

import { CommonPriorityBalancesAndAllowancesUpdater } from './CommonPriorityBalancesAndAllowancesUpdater'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../../tokensList/state/selectTokenWidgetAtom'
import { useBridgeCustomTokensForChain } from '../hooks/useBridgeCustomTokensForChain'
import { useOrdersFilledEventsTrigger } from '../hooks/useOrdersFilledEventsTrigger'

jest.mock('@cowprotocol/balances-and-allowances', () => ({
  ...jest.requireActual('@cowprotocol/balances-and-allowances'),
  BalancesWatcherUpdater: jest.fn(() => null),
  BalancesAndAllowancesUpdater: jest.fn(() => null),
  PriorityTokensUpdater: jest.fn(() => null),
  PRIORITY_TOKENS_REFRESH_INTERVAL: 60_000,
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useFeatureFlags: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
}))

jest.mock('entities/balancesContext/useBalancesContext', () => ({
  useBalancesContext: jest.fn(),
}))

jest.mock('modules/tokensList', () => ({
  ...jest.requireActual('modules/tokensList'),
  useSelectTokenWidgetState: jest.fn(),
  useSourceChainId: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  ...jest.requireActual('modules/trade'),
  usePriorityTokenAddresses: jest.fn(),
}))

jest.mock('../hooks/useBridgeCustomTokensForChain', () => ({
  useBridgeCustomTokensForChain: jest.fn(),
}))

jest.mock('../hooks/useOrdersFilledEventsTrigger', () => ({
  useOrdersFilledEventsTrigger: jest.fn(),
}))

const mockBalancesWatcherUpdater = BalancesWatcherUpdater as jest.MockedFunction<typeof BalancesWatcherUpdater>
const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseBalancesContext = useBalancesContext as jest.MockedFunction<typeof useBalancesContext>
const mockUseSelectTokenWidgetState = useSelectTokenWidgetState as jest.MockedFunction<typeof useSelectTokenWidgetState>
const mockUseSourceChainId = useSourceChainId as jest.MockedFunction<typeof useSourceChainId>
const mockUsePriorityTokenAddresses = usePriorityTokenAddresses as jest.MockedFunction<typeof usePriorityTokenAddresses>
const mockUseBridgeCustomTokensForChain = useBridgeCustomTokensForChain as jest.MockedFunction<
  typeof useBridgeCustomTokensForChain
>
const mockUseOrdersFilledEventsTrigger = useOrdersFilledEventsTrigger as jest.MockedFunction<
  typeof useOrdersFilledEventsTrigger
>

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
function createWidgetState(override: Partial<typeof DEFAULT_SELECT_TOKEN_WIDGET_STATE>): WidgetState {
  return { ...DEFAULT_SELECT_TOKEN_WIDGET_STATE, ...override } as WidgetState
}

describe('CommonPriorityBalancesAndAllowancesUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseFeatureFlags.mockReturnValue({ isBwEnabled: true } as ReturnType<typeof useFeatureFlags>)
    mockUseWalletInfo.mockReturnValue({
      account: '0x0000000000000000000000000000000000000001',
      chainId: SupportedChainId.MAINNET,
    } as WalletInfo)
    mockUseBalancesContext.mockReturnValue({ account: undefined } as ReturnType<typeof useBalancesContext>)
    mockUsePriorityTokenAddresses.mockReturnValue(new Set())
    mockUseBridgeCustomTokensForChain.mockReturnValue([])
    mockUseOrdersFilledEventsTrigger.mockReturnValue(0)
  })

  it('passes isBridgeMode=true when output selector is open on a non-wallet chain', () => {
    mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.BASE, source: 'selector' })
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true, field: Field.OUTPUT }))

    render(<CommonPriorityBalancesAndAllowancesUpdater />)

    expect(mockBalancesWatcherUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ isBridgeMode: true, chainId: SupportedChainId.BASE }),
      undefined,
    )
  })

  it('passes isBridgeMode=false when INPUT selector is open on a non-wallet chain (regression guard)', () => {
    mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.BASE, source: 'selector' })
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true, field: Field.INPUT }))

    render(<CommonPriorityBalancesAndAllowancesUpdater />)

    expect(mockBalancesWatcherUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ isBridgeMode: false, chainId: SupportedChainId.BASE }),
      undefined,
    )
  })

  it('passes isBridgeMode=false when selector is closed (wallet chain)', () => {
    mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.MAINNET, source: 'wallet' })
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: false }))

    render(<CommonPriorityBalancesAndAllowancesUpdater />)

    expect(mockBalancesWatcherUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ isBridgeMode: false, chainId: SupportedChainId.MAINNET }),
      undefined,
    )
  })
})
