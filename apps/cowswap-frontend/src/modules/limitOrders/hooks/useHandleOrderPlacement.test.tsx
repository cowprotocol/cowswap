import { useAtom } from 'jotai'
import { PropsWithChildren } from 'react'

import { USDC_BASE, USDT_BASE } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { useIsTxBundlingSupported, useWalletInfo } from '@cowprotocol/wallet'

import { act, renderHook, waitFor } from '@testing-library/react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { useSolanaTradeFlowContext } from 'modules/limitOrders/hooks/useSolanaTradeFlowContext'
import { useTradeFlowContext } from 'modules/limitOrders/hooks/useTradeFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { solanaFlow } from 'modules/tradeFlow'

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
jest.mock('modules/limitOrders/hooks/useTradeFlowContext')
jest.mock('modules/limitOrders/hooks/useSolanaTradeFlowContext')
// Not a plain spread-actual mock: `modules/tradeFlow`'s barrel also re-exports `useHandleSwap`, whose
// import chain (ethFlow -> legacy tx hooks -> balances-and-allowances -> sdk-trading-solana) circularly
// re-imports `modules/tradeFlow` while this factory is still resolving. That reentrancy makes Jest invoke
// this factory a second time, producing a second, disconnected `solanaFlow` mock that this file's
// `beforeEach` never configures. `useHandleOrderPlacement` only consumes `solanaFlow` from this module
// (the only other in-tree consumer, `useSolanaTradeFlowContext`, is separately auto-mocked below), so we
// mock just that export instead of spreading the real barrel.
jest.mock('modules/tradeFlow', () => ({
  solanaFlow: jest.fn(),
}))
jest.mock('common/hooks/useNeedsApproval')
jest.mock('common/hooks/useIsSafeApprovalBundle')
jest.mock('@cowprotocol/wallet', () => {
  const actual = jest.requireActual('@cowprotocol/wallet')
  // Created once inside the (cached) factory closure, not inline in the switch below: a fresh `jest.fn()`
  // returned on every Proxy `get` would hand `useHandleOrderPlacement`'s own `useWalletInfo()` call a
  // different, unconfigured mock instance than the one this file's `beforeEach`/tests configure via the
  // `useWalletInfo` import below - the same disconnected-mock footgun documented above for `modules/tradeFlow`.
  const useWalletInfoMock = jest.fn()

  return new Proxy(actual, {
    get: (target, property) => {
      switch (property) {
        case 'useIsTxBundlingSupported': {
          return jest.fn()
        }
        case 'useWalletInfo': {
          return useWalletInfoMock
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
const mockSolanaFlow = solanaFlow as jest.MockedFunction<typeof solanaFlow>
const mockUseNavigateToOpenOrdersTable = useNavigateToOrdersTableTab as jest.MockedFunction<
  typeof useNavigateToOrdersTableTab
>

const mockUseSafeBundleFlowContext = useSafeBundleFlowContext as jest.MockedFunction<typeof useSafeBundleFlowContext>
const mockUseTradeFlowContext = useTradeFlowContext as jest.MockedFunction<typeof useTradeFlowContext>
const mockUseSolanaTradeFlowContext = useSolanaTradeFlowContext as jest.MockedFunction<typeof useSolanaTradeFlowContext>
const mockUseNeedsApproval = useNeedsApproval as jest.MockedFunction<typeof useNeedsApproval>
const mockIsBundlingSupported = useIsTxBundlingSupported as jest.MockedFunction<typeof useIsTxBundlingSupported>
const mockUseIsSafeApprovalBundle = useIsSafeApprovalBundle as jest.MockedFunction<typeof useIsSafeApprovalBundle>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

// Reused across the Solana-branch tests below - same address the `useTransactionAdder.solana.test.tsx`
// and `useSendOnChainCancellation.test.tsx` Solana wallet mocks use.
const solanaAccount = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'

const tradeContextMock = {
  postOrderParams: {
    partiallyFillable: true,
    inputAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '1'),
    outputAmount: CurrencyAmount.fromRawAmount(USDT_BASE, '1'),
    isSafeWallet: true,
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

// eslint-disable-next-line max-lines-per-function
describe('useHandleOrderPlacement', () => {
  beforeEach(() => {
    // This file has no global clearMocks/resetMocks config, so call history otherwise carries over
    // between tests (e.g. the first test's tradeFlow call would still show up in a later test's
    // `expect(mockTradeFlow).not.toHaveBeenCalled()`). Clear it explicitly before each test.
    mockTradeFlow.mockClear()
    mockSafeBundleFlow.mockClear()
    mockSolanaFlow.mockClear()

    mockTradeFlow.mockImplementation(() => Promise.resolve('0xOrderHash'))
    mockSafeBundleFlow.mockImplementation(() => Promise.resolve('0xOrderHash'))
    mockSolanaFlow.mockImplementation(() => Promise.resolve(true))
    mockUseSafeBundleFlowContext.mockImplementation(() => null)
    mockUseTradeFlowContext.mockImplementation(() => tradeContextMock)
    mockUseSolanaTradeFlowContext.mockImplementation(() => null)
    mockUseNeedsApproval.mockImplementation(() => false)
    mockIsBundlingSupported.mockImplementation(() => true)
    mockUseNavigateToOpenOrdersTable.mockImplementation(() => () => {})
    mockUseIsSafeApprovalBundle.mockImplementation(() => false)
    // Default to an EVM chain (matches the real useWalletInfo atom's default) - the isSolana dispatch
    // gate is `isSolanaChain(chainId)`, so the Solana-branch tests below must override this to a Solana
    // chainId themselves rather than relying on solanaContext alone.
    mockUseWalletInfo.mockImplementation(() => ({ chainId: SupportedChainId.MAINNET }))
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
      () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper },
    )
    await act(async () => {
      await result.current.callback()
    })

    // Assert
    const { result: limitOrdersStateResultAfter } = renderHook(() => useLimitOrdersRawState(), {
      wrapper,
    })
    expect(limitOrdersStateResultAfter.current.recipient).toBe(null)
  })

  it('reports isTradeContextReady from the EVM context when not on Solana', () => {
    mockUseWalletInfo.mockImplementation(() => ({ chainId: SupportedChainId.MAINNET }))
    mockUseTradeFlowContext.mockImplementation(() => tradeContextMock)
    mockUseSolanaTradeFlowContext.mockImplementation(() => null)

    const { result } = renderHook(
      () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper },
    )

    expect(result.current.isTradeContextReady).toBe(true)
  })

  it('dispatches to solanaFlow, not tradeFlow, when a Solana context is present and the EVM context is null', async () => {
    // The isSolana dispatch gate reads the connected wallet's chainId - mock it to Solana here, on top of
    // the Solana context, since a real Solana connection is what makes useTradeFlowContext resolve null.
    mockUseWalletInfo.mockImplementation(() => ({ chainId: SupportedChainId.SOLANA, account: solanaAccount }))
    // On a Solana chain, useTradeFlowContext (EVM-only) always resolves null.
    mockUseTradeFlowContext.mockImplementation(() => null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const solanaContextMock = { context: { orderKind: 'sell', chainId: 792703809 } } as any
    mockUseSolanaTradeFlowContext.mockImplementation(() => solanaContextMock)

    const { result } = renderHook(
      () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper },
    )

    expect(result.current.isTradeContextReady).toBe(true)

    await act(async () => {
      await result.current.callback()
    })

    expect(mockSolanaFlow).toHaveBeenCalledWith(solanaContextMock, expect.anything())
    expect(mockTradeFlow).not.toHaveBeenCalled()
    expect(mockSafeBundleFlow).not.toHaveBeenCalled()
  })

  it('does not call tradeConfirmActions.onSuccess a second time after a successful Solana placement (solanaFlow already called it)', async () => {
    mockUseWalletInfo.mockImplementation(() => ({ chainId: SupportedChainId.SOLANA, account: solanaAccount }))
    mockUseTradeFlowContext.mockImplementation(() => null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const solanaContextMock = { context: { orderKind: 'sell', chainId: 792703809 } } as any
    mockUseSolanaTradeFlowContext.mockImplementation(() => solanaContextMock)
    const onSuccessSpy = jest.fn()

    const { result } = renderHook(
      () =>
        useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, {
          ...tradeConfirmActions,
          onSuccess: onSuccessSpy,
        }),
      { wrapper },
    )

    await act(async () => {
      await result.current.callback()
    })

    expect(onSuccessSpy).not.toHaveBeenCalled()
  })

  it('uses the regular permit flow instead of an approval bundle', async () => {
    mockUseIsSafeApprovalBundle.mockReturnValue(true)
    const permitTradeContext = {
      ...tradeContextMock,
      allowsOffchainSigning: true,
      permitInfo: { type: 'eip-2612', name: 'USDC', version: '2' },
    } as TradeFlowContext
    mockUseTradeFlowContext.mockImplementation(() => permitTradeContext)

    const { result } = renderHook(
      () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper },
    )
    await act(result.current.callback)

    expect(mockTradeFlow).toHaveBeenCalled()
    expect(mockSafeBundleFlow).not.toHaveBeenCalled()
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
        () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current.callback()
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
        () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current.callback()
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
        () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current.callback()
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
        () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current.callback()
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
        () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current.callback()
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
        () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current.callback()
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
        () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current.callback()
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
        () => useHandleOrderPlacement(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )
      await act(async () => {
        await result.current.callback()
      })

      // Assert - override should remain true after failure
      expect(atomResult.current[0]).toBe(true)
    })
  })
})
