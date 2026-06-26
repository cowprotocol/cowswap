import { Provider as JotaiProvider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import {
  BalancesAndAllowancesUpdater,
  BalancesWatcherHealth,
  balancesWatcherHealthAtom,
  BalancesWatcherUpdater,
  PriorityTokensUpdater,
} from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { render } from '@testing-library/react'
import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState, useSourceChainId } from 'modules/tokensList'
import { usePriorityTokenAddresses } from 'modules/trade'

import { CommonPriorityBalancesAndAllowancesUpdater } from './CommonPriorityBalancesAndAllowancesUpdater'

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
const mockBalancesAndAllowancesUpdater = BalancesAndAllowancesUpdater as jest.MockedFunction<
  typeof BalancesAndAllowancesUpdater
>
const mockPriorityTokensUpdater = PriorityTokensUpdater as jest.MockedFunction<typeof PriorityTokensUpdater>
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
function createWidgetState(override: Partial<WidgetState>): WidgetState {
  return { open: false, ...override } as WidgetState
}

function HealthHydrator({ health, children }: { health: BalancesWatcherHealth; children: ReactNode }): ReactNode {
  useHydrateAtoms([[balancesWatcherHealthAtom, health]])
  return <>{children}</>
}

function renderWithHealth(health: BalancesWatcherHealth = BalancesWatcherHealth.Healthy): void {
  render(
    <JotaiProvider>
      <HealthHydrator health={health}>
        <CommonPriorityBalancesAndAllowancesUpdater />
      </HealthHydrator>
    </JotaiProvider>,
  )
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

    renderWithHealth(BalancesWatcherHealth.Healthy)

    expect(mockBalancesWatcherUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ isBridgeMode: true, chainId: SupportedChainId.BASE }),
      undefined,
    )
  })

  it('passes isBridgeMode=false when INPUT selector is open on a non-wallet chain (regression guard)', () => {
    mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.BASE, source: 'selector' })
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: true, field: Field.INPUT }))

    renderWithHealth(BalancesWatcherHealth.Healthy)

    expect(mockBalancesWatcherUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ isBridgeMode: false, chainId: SupportedChainId.BASE }),
      undefined,
    )
  })

  it('passes isBridgeMode=false when selector is closed (wallet chain)', () => {
    mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.MAINNET, source: 'wallet' })
    mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: false }))

    renderWithHealth(BalancesWatcherHealth.Healthy)

    expect(mockBalancesWatcherUpdater).toHaveBeenCalledWith(
      expect.objectContaining({ isBridgeMode: false, chainId: SupportedChainId.MAINNET }),
      undefined,
    )
  })

  describe('watcher fallback wiring', () => {
    beforeEach(() => {
      mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.MAINNET, source: 'wallet' })
      mockUseSelectTokenWidgetState.mockReturnValue(createWidgetState({ open: false }))
    })

    it.each<BalancesWatcherHealth>([
      BalancesWatcherHealth.Idle,
      BalancesWatcherHealth.Connecting,
      BalancesWatcherHealth.Connected,
      BalancesWatcherHealth.Healthy,
    ])('mounts only the watcher (no multicall fallback) when health is %s', (health) => {
      renderWithHealth(health)

      expect(mockBalancesWatcherUpdater).toHaveBeenCalledTimes(1)
      expect(mockBalancesAndAllowancesUpdater).not.toHaveBeenCalled()
      expect(mockPriorityTokensUpdater).not.toHaveBeenCalled()
    })

    it('mounts the watcher AND the multicall stack in parallel when health is fallback', () => {
      renderWithHealth(BalancesWatcherHealth.Fallback)

      expect(mockBalancesWatcherUpdater).toHaveBeenCalledTimes(1)
      expect(mockBalancesAndAllowancesUpdater).toHaveBeenCalledTimes(1)
      expect(mockPriorityTokensUpdater).toHaveBeenCalledTimes(1)
    })

    it('mounts only the multicall stack when the bw feature flag is disabled', () => {
      mockUseFeatureFlags.mockReturnValue({ isBwEnabled: false } as ReturnType<typeof useFeatureFlags>)

      renderWithHealth(BalancesWatcherHealth.Healthy)

      expect(mockBalancesWatcherUpdater).not.toHaveBeenCalled()
      expect(mockBalancesAndAllowancesUpdater).toHaveBeenCalledTimes(1)
      expect(mockPriorityTokensUpdater).toHaveBeenCalledTimes(1)
    })

    it('mounts only the multicall stack on a non-EVM chain even with the bw flag on', () => {
      mockUseSourceChainId.mockReturnValue({ chainId: SupportedChainId.SOLANA, source: 'wallet' })

      renderWithHealth(BalancesWatcherHealth.Healthy)

      expect(mockBalancesWatcherUpdater).not.toHaveBeenCalled()
      expect(mockBalancesAndAllowancesUpdater).toHaveBeenCalledTimes(1)
      expect(mockPriorityTokensUpdater).toHaveBeenCalledTimes(1)
    })
  })
})
