import { useIsTxBundlingSupported } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { useNavigateToOpenOrdersTable } from 'modules/ordersTable'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { TradeAmounts } from 'common/types'
import { WithModalProvider } from 'utils/withModalProvider'

import { useHandleOrderPlacement } from './useHandleOrderPlacement'
import { useLimitOrdersRawState, useUpdateLimitOrdersRawState } from './useLimitOrdersRawState'

import { TradeConfirmActions } from '../../trade'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'

jest.mock('modules/limitOrders/services/tradeFlow')
jest.mock('modules/limitOrders/services/safeBundleFlow')
jest.mock('modules/ordersTable')

jest.mock('modules/limitOrders/hooks/useSafeBundleFlowContext')
jest.mock('common/hooks/useNeedsApproval')
jest.mock('@cowprotocol/wallet', () => {
  const actual = jest.requireActual('@cowprotocol/wallet')

  return new Proxy(actual, {
    get: (target, property) => {
      switch (property) {
        case 'useIsTxBundlingSupported': {
          return jest.fn()
        }
        default: {
          return target[property]
        }
      }
    },
  })
})

const mockTradeFlow = tradeFlow as jest.MockedFunction<typeof tradeFlow>
const mockSafeBundleFlow = safeBundleFlow as jest.MockedFunction<typeof safeBundleFlow>
const mockUseNavigateToOpenOrdersTable = useNavigateToOpenOrdersTable as jest.MockedFunction<
  typeof useNavigateToOpenOrdersTable
>

const mockUseSafeBundleFlowContext = useSafeBundleFlowContext as jest.MockedFunction<typeof useSafeBundleFlowContext>
const mockUseNeedsApproval = useNeedsApproval as jest.MockedFunction<typeof useNeedsApproval>
const mockIsBundlingSupported = useIsTxBundlingSupported as jest.MockedFunction<typeof useIsTxBundlingSupported>

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tradeContextMock = { postOrderParams: { partiallyFillable: true } } as any as TradeFlowContext
const priceImpactMock: PriceImpact = {
  priceImpact: undefined,
  loading: false,
}
const recipient = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
const tradeConfirmActions: TradeConfirmActions = {
  onSign(pendingTrade: TradeAmounts) {
    console.log('onSign', pendingTrade)
  },
  onError(error: string) {
    console.log('onError', error)
  },
  onSuccess(transactionHash: string) {
    console.log('onSuccess', transactionHash)
  },
  onDismiss() {
    console.log('onDismiss')
  },
  onOpen() {
    console.log('onOpen')
  },
  requestPermitSignature() {
    console.log('requestPermitSignature')
  },
}

describe('useHandleOrderPlacement', () => {
  beforeEach(() => {
    mockTradeFlow.mockImplementation(() => Promise.resolve(''))
    mockSafeBundleFlow.mockImplementation(() => Promise.resolve(''))
    mockUseSafeBundleFlowContext.mockImplementation(() => null)
    mockUseNeedsApproval.mockImplementation(() => false)
    mockIsBundlingSupported.mockImplementation(() => true)
    mockUseNavigateToOpenOrdersTable.mockImplementation(() => () => {})
  })

  it('When a limit order placed, then the recipient value should be deleted', async () => {
    // Arrange
    renderHook(
      () => {
        const updateLimitOrdersState = useUpdateLimitOrdersRawState()

        updateLimitOrdersState({ recipient })
      },
      { wrapper: WithModalProvider },
    )

    // Assert
    const { result: limitOrdersStateResultBefore } = renderHook(() => useLimitOrdersRawState(), {
      wrapper: WithModalProvider,
    })
    expect(limitOrdersStateResultBefore.current.recipient).toBe(recipient)

    // Act
    const { result } = renderHook(
      () => useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper: WithModalProvider },
    )
    await result.current()

    // Assert
    const { result: limitOrdersStateResultAfter } = renderHook(() => useLimitOrdersRawState(), {
      wrapper: WithModalProvider,
    })
    expect(limitOrdersStateResultAfter.current.recipient).toBe(null)
  })
})
