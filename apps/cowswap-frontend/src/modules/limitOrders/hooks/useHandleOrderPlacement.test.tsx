import { useAtom } from 'jotai'
import { PropsWithChildren } from 'react'

import { USDC_BASE, USDT_BASE } from '@cowprotocol/common-const'
import { useIsTxBundlingSupported } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { act, renderHook, waitFor } from '@testing-library/react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { useNavigateToOrdersTableTab } from 'modules/ordersTable'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { TradeAmounts } from 'common/types'
import { WithModalProvider } from 'utils/withModalProvider'

import { useHandleOrderPlacement } from './useHandleOrderPlacement'
import { useLimitOrdersRawState, useUpdateLimitOrdersRawState } from './useLimitOrdersRawState'

import { WithMockedWeb3 } from '../../../test-utils'
import { TradeConfirmActions } from '../../trade'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'
import { partiallyFillableOverrideAtom } from '../state/partiallyFillableOverride'

jest.mock('modules/limitOrders/services/tradeFlow')
jest.mock('modules/limitOrders/services/safeBundleFlow')
jest.mock('modules/ordersTable')

jest.mock('modules/limitOrders/hooks/useSafeBundleFlowContext')
jest.mock('common/hooks/useNeedsApproval')
jest.mock('common/hooks/useIsSafeApprovalBundle')
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
const mockUseNavigateToOpenOrdersTable = useNavigateToOrdersTableTab as jest.MockedFunction<
  typeof useNavigateToOrdersTableTab
>

const mockUseSafeBundleFlowContext = useSafeBundleFlowContext as jest.MockedFunction<typeof useSafeBundleFlowContext>
const mockUseNeedsApproval = useNeedsApproval as jest.MockedFunction<typeof useNeedsApproval>
const mockIsBundlingSupported = useIsTxBundlingSupported as jest.MockedFunction<typeof useIsTxBundlingSupported>
const mockUseIsSafeApprovalBundle = useIsSafeApprovalBundle as jest.MockedFunction<typeof useIsSafeApprovalBundle>

const tradeContextMock = {
  postOrderParams: {
    partiallyFillable: true,
    inputAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '1'),
    outputAmount: CurrencyAmount.fromRawAmount(USDT_BASE, '1'),
  },
} as never as TradeFlowContext
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <WithMockedWeb3>
      <WithModalProvider>{children}</WithModalProvider>
    </WithMockedWeb3>
  )
}

describe('useHandleOrderPlacement', () => {
  beforeEach(() => {
    mockTradeFlow.mockImplementation(() => Promise.resolve('0xOrderHash'))
    mockSafeBundleFlow.mockImplementation(() => Promise.resolve('0xOrderHash'))
    mockUseSafeBundleFlowContext.mockImplementation(() => null)
    mockUseNeedsApproval.mockImplementation(() => false)
    mockIsBundlingSupported.mockImplementation(() => true)
    mockUseNavigateToOpenOrdersTable.mockImplementation(() => () => {})
    mockUseIsSafeApprovalBundle.mockImplementation(() => false)
  })

  it('When a limit order placed, then the recipient value should be deleted', async () => {
    // Arrange
    renderHook(
      () => {
        const updateLimitOrdersState = useUpdateLimitOrdersRawState()

        updateLimitOrdersState({ recipient })
      },
      { wrapper },
    )

    // Assert
    const { result: limitOrdersStateResultBefore } = renderHook(() => useLimitOrdersRawState(), {
      wrapper,
    })
    expect(limitOrdersStateResultBefore.current.recipient).toBe(recipient)

    // Act
    const { result } = renderHook(
      () => useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper },
    )
    await act(async () => {
      await result.current()
    })

    // Assert
    const { result: limitOrdersStateResultAfter } = renderHook(() => useLimitOrdersRawState(), {
      wrapper,
    })
    expect(limitOrdersStateResultAfter.current.recipient).toBe(null)
  })

  describe('partiallyFillableOverride', () => {
    it('When partiallyFillableOverride is undefined, then no override should be passed to tradeFlow', async () => {
      // Arrange
      const { result: atomResult } = renderHook(() => useAtom(partiallyFillableOverrideAtom), {
        wrapper,
      })
      // Set override to undefined
      act(() => {
        atomResult.current[1](undefined)
      })

      // Act
      const { result } = renderHook(
        () =>
          useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current()
      })

      // Assert - tradeFlow should be called without partiallyFillable in params
      expect(mockTradeFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          postOrderParams: expect.objectContaining({
            partiallyFillable: true, // Original value from tradeContextMock
          }),
        }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      )
    })

    it('When partiallyFillableOverride is true, then it should be passed to tradeFlow', async () => {
      // Arrange
      const { result: atomResult } = renderHook(() => useAtom(partiallyFillableOverrideAtom), {
        wrapper,
      })
      // Set override to true
      act(() => {
        atomResult.current[1](true)
      })

      // Act
      const { result } = renderHook(
        () =>
          useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current()
      })

      // Assert - tradeFlow should be called with partiallyFillable: true
      expect(mockTradeFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          postOrderParams: expect.objectContaining({
            partiallyFillable: true,
          }),
        }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      )
    })

    it('When partiallyFillableOverride is false, then it should be passed to tradeFlow', async () => {
      // Arrange
      const { result: atomResult } = renderHook(() => useAtom(partiallyFillableOverrideAtom), {
        wrapper,
      })
      // Set override to false
      act(() => {
        atomResult.current[1](false)
      })

      // Act
      const { result } = renderHook(
        () =>
          useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current()
      })

      // Assert - tradeFlow should be called with partiallyFillable: false
      expect(mockTradeFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          postOrderParams: expect.objectContaining({
            partiallyFillable: false,
          }),
        }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      )
    })

    it('When order is successfully placed, then partiallyFillableOverride should be reset to undefined', async () => {
      // Arrange
      const { result: atomResult } = renderHook(() => useAtom(partiallyFillableOverrideAtom), {
        wrapper,
      })
      // Set override to true initially
      act(() => {
        atomResult.current[1](true)
      })
      expect(atomResult.current[0]).toBe(true)

      // Act
      const { result } = renderHook(
        () =>
          useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current()
      })

      // Assert - override should be reset to undefined after successful placement
      await waitFor(() => {
        expect(atomResult.current[0]).toBe(undefined)
      })
    })

    it('When using safeBundleFlow and partiallyFillableOverride is true, then it should be passed to safeBundleFlow', async () => {
      // Arrange
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeBundleContext = { postOrderParams: { partiallyFillable: false } } as any
      mockUseSafeBundleFlowContext.mockImplementation(() => safeBundleContext)
      mockUseIsSafeApprovalBundle.mockImplementation(() => true) // Trigger safe bundle flow

      const { result: atomResult } = renderHook(() => useAtom(partiallyFillableOverrideAtom), {
        wrapper,
      })
      // Set override to true
      act(() => {
        atomResult.current[1](true)
      })

      // Act
      const { result } = renderHook(
        () =>
          useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current()
      })

      // Assert - safeBundleFlow should be called with partiallyFillable: true
      expect(mockSafeBundleFlow).toHaveBeenCalledWith({
        params: expect.objectContaining({
          postOrderParams: expect.objectContaining({
            partiallyFillable: true,
          }),
        }),
        priceImpact: expect.anything(),
        settingsState: expect.anything(),
        confirmPriceImpactWithoutFee: expect.anything(),
        analytics: expect.anything(),
        beforeTrade: expect.anything(),
        config: expect.anything(),
      })
    })

    it('When using safeBundleFlow and partiallyFillableOverride is false, then it should be passed to safeBundleFlow', async () => {
      // Arrange
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeBundleContext = { postOrderParams: { partiallyFillable: true } } as any
      mockUseSafeBundleFlowContext.mockImplementation(() => safeBundleContext)
      mockUseIsSafeApprovalBundle.mockImplementation(() => true) // Trigger safe bundle flow

      const { result: atomResult } = renderHook(() => useAtom(partiallyFillableOverrideAtom), {
        wrapper,
      })
      // Set override to false
      act(() => {
        atomResult.current[1](false)
      })

      // Act
      const { result } = renderHook(
        () =>
          useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current()
      })

      // Assert - safeBundleFlow should be called with partiallyFillable: false
      expect(mockSafeBundleFlow).toHaveBeenCalledWith({
        params: expect.objectContaining({
          postOrderParams: expect.objectContaining({
            partiallyFillable: false,
          }),
        }),
        priceImpact: expect.anything(),
        settingsState: expect.anything(),
        confirmPriceImpactWithoutFee: expect.anything(),
        analytics: expect.anything(),
        beforeTrade: expect.anything(),
        config: expect.anything(),
      })
    })

    it('When using safeBundleFlow and partiallyFillableOverride is undefined, then no override should be passed', async () => {
      // Arrange
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeBundleContext = { postOrderParams: { partiallyFillable: true } } as any
      mockUseSafeBundleFlowContext.mockImplementation(() => safeBundleContext)
      mockUseIsSafeApprovalBundle.mockImplementation(() => true) // Trigger safe bundle flow

      const { result: atomResult } = renderHook(() => useAtom(partiallyFillableOverrideAtom), {
        wrapper,
      })
      // Set override to undefined
      act(() => {
        atomResult.current[1](undefined)
      })

      // Act
      const { result } = renderHook(
        () =>
          useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current()
      })

      // Assert - safeBundleFlow should be called with original partiallyFillable value
      expect(mockSafeBundleFlow).toHaveBeenCalledWith({
        params: expect.objectContaining({
          postOrderParams: expect.objectContaining({
            partiallyFillable: true, // Original value from safeBundleContext
          }),
        }),
        priceImpact: expect.anything(),
        settingsState: expect.anything(),
        confirmPriceImpactWithoutFee: expect.anything(),
        analytics: expect.anything(),
        beforeTrade: expect.anything(),
        config: expect.anything(),
      })
    })

    it('When order fails, then partiallyFillableOverride should NOT be reset', async () => {
      // Arrange
      mockTradeFlow.mockImplementation(() => Promise.reject(new Error('Order failed')))

      const { result: atomResult } = renderHook(() => useAtom(partiallyFillableOverrideAtom), {
        wrapper,
      })
      // Set override to true initially
      act(() => {
        atomResult.current[1](true)
      })
      expect(atomResult.current[0]).toBe(true)

      // Act
      const { result } = renderHook(
        () =>
          useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current()
      })

      // Assert - override should remain true after failure
      expect(atomResult.current[0]).toBe(true)
    })
  })
})
