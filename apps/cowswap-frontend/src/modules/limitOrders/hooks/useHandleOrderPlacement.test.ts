import { useAtomValue, useSetAtom } from 'jotai'

import { useIsBundlingSupported } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react-hooks'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { TradeFlowContext } from 'modules/limitOrders/services/types'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { TradeAmounts } from 'common/types'
import { withModalProvider } from 'utils/withModalProvider'

import { useHandleOrderPlacement } from './useHandleOrderPlacement'

import { TradeConfirmActions } from '../../trade'
import { limitOrdersRawStateAtom, updateLimitOrdersRawStateAtom } from '../state/limitOrdersRawStateAtom'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'

jest.mock('modules/limitOrders/services/tradeFlow')
jest.mock('modules/limitOrders/services/safeBundleFlow')

jest.mock('modules/limitOrders/hooks/useSafeBundleFlowContext')
jest.mock('common/hooks/useNeedsApproval')
jest.mock('@cowprotocol/wallet', () => {
  const actual = jest.requireActual('@cowprotocol/wallet')

  return new Proxy(actual, {
    get: (target, property) => {
      switch (property) {
        case 'useIsBundlingSupported': {
          return jest.fn()
        }
        default: {
          return target[property]
        }
      }
    },
  })
})
jest.mock('common/hooks/useAnalyticsReporter')

const mockTradeFlow = tradeFlow as jest.MockedFunction<typeof tradeFlow>
const mockSafeBundleFlow = safeBundleFlow as jest.MockedFunction<typeof safeBundleFlow>

const mockUseSafeBundleFlowContext = useSafeBundleFlowContext as jest.MockedFunction<typeof useSafeBundleFlowContext>
const mockUseNeedsApproval = useNeedsApproval as jest.MockedFunction<typeof useNeedsApproval>
const mockIsBundlingSupported = useIsBundlingSupported as jest.MockedFunction<typeof useIsBundlingSupported>

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
}

describe('useHandleOrderPlacement', () => {
  beforeEach(() => {
    mockTradeFlow.mockImplementation(() => Promise.resolve(''))
    mockSafeBundleFlow.mockImplementation(() => Promise.resolve(''))
    mockUseSafeBundleFlowContext.mockImplementation(() => null)
    mockUseNeedsApproval.mockImplementation(() => false)
    mockIsBundlingSupported.mockImplementation(() => true)
  })

  it('When a limit order placed, then the recipient value should be deleted', async () => {
    // Arrange
    renderHook(
      () => {
        const updateLimitOrdersState = useSetAtom(updateLimitOrdersRawStateAtom)

        updateLimitOrdersState({ recipient })
      },
      { wrapper: withModalProvider }
    )

    // Assert
    const { result: limitOrdersStateResultBefore } = renderHook(() => useAtomValue(limitOrdersRawStateAtom), {
      wrapper: withModalProvider,
    })
    expect(limitOrdersStateResultBefore.current.recipient).toBe(recipient)

    // Act
    const { result } = renderHook(
      () => useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper: withModalProvider }
    )
    await result.current()

    // Assert
    const { result: limitOrdersStateResultAfter } = renderHook(() => useAtomValue(limitOrdersRawStateAtom), {
      wrapper: withModalProvider,
    })
    expect(limitOrdersStateResultAfter.current.recipient).toBe(null)
  })
})
