import { PropsWithChildren } from 'react'

import { USDC_BASE, USDT_BASE } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook, RenderHookResult, waitFor } from '@testing-library/react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { callWidgetHook } from 'modules/injectedWidget'
import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { useSolanaTradeFlowContext } from 'modules/limitOrders/hooks/useSolanaTradeFlowContext'
import { useTradeFlowContext } from 'modules/limitOrders/hooks/useTradeFlowContext'
import { useTradeFlowParams } from 'modules/limitOrders/hooks/useTradeFlowParams'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { solanaFlow, SolanaTradeFlowContext } from 'modules/tradeFlow'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { WithModalProvider } from 'utils/withModalProvider'

import { useLimitOrdersTradeCallback } from './useLimitOrdersTradeCallback'

import { WithMockedWeb3 } from '../../../test-utils'
import { TradeConfirmActions } from '../../trade'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'

jest.mock('modules/limitOrders/services/tradeFlow')
jest.mock('modules/limitOrders/services/safeBundleFlow')
jest.mock('modules/limitOrders/hooks/useSafeBundleFlowContext')
jest.mock('modules/limitOrders/hooks/useTradeFlowContext')
jest.mock('modules/limitOrders/hooks/useSolanaTradeFlowContext')
jest.mock('modules/limitOrders/hooks/useTradeFlowParams')
jest.mock('common/hooks/useIsSafeApprovalBundle')
jest.mock('modules/limitOrders/utils/calculateLimitOrdersDeadline', () => ({
  calculateLimitOrdersDeadline: () => 1700000000,
}))
jest.mock('modules/injectedWidget', () => {
  const actual = jest.requireActual('modules/injectedWidget')
  return { ...actual, callWidgetHook: jest.fn().mockResolvedValue(true) }
})
// Same footgun as useHandleOrderPlacement.test.tsx: `modules/tradeFlow`'s barrel re-exports `useHandleSwap`,
// whose import chain circularly re-imports `modules/tradeFlow` while this factory is still resolving,
// producing a second, disconnected `solanaFlow` mock this file's `beforeEach` never configures. This hook
// only consumes `solanaFlow` from that module, so mock just that export instead of spreading the barrel.
jest.mock('modules/tradeFlow', () => ({
  solanaFlow: jest.fn(),
}))
jest.mock('@cowprotocol/wallet', () => {
  const actual = jest.requireActual('@cowprotocol/wallet')
  const useWalletInfoMock = jest.fn()

  return new Proxy(actual, {
    get: (target, property) => {
      if (property === 'useWalletInfo') return useWalletInfoMock
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (target as any)[property]
    },
  })
})

const mockTradeFlow = tradeFlow as jest.MockedFunction<typeof tradeFlow>
const mockSafeBundleFlow = safeBundleFlow as jest.MockedFunction<typeof safeBundleFlow>
const mockSolanaFlow = solanaFlow as jest.MockedFunction<typeof solanaFlow>
const mockCallWidgetHook = callWidgetHook as jest.MockedFunction<typeof callWidgetHook>
const mockUseSafeBundleFlowContext = useSafeBundleFlowContext as jest.MockedFunction<typeof useSafeBundleFlowContext>
const mockUseTradeFlowContext = useTradeFlowContext as jest.MockedFunction<typeof useTradeFlowContext>
const mockUseSolanaTradeFlowContext = useSolanaTradeFlowContext as jest.MockedFunction<typeof useSolanaTradeFlowContext>
const mockUseTradeFlowParams = useTradeFlowParams as jest.MockedFunction<typeof useTradeFlowParams>
const mockUseIsSafeApprovalBundle = useIsSafeApprovalBundle as jest.MockedFunction<typeof useIsSafeApprovalBundle>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

// Same address the other Solana-branch tests in this module use.
const solanaAccount = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'

const tradeFlowParamsMock = { analytics: 'evm-tradeFlowParams-analytics' } as never

const tradeContextMock = {
  chainId: SupportedChainId.MAINNET,
  quoteState: {},
  allowsOffchainSigning: false,
  permitInfo: undefined,
  postOrderParams: {
    kind: 'sell',
    recipient: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    isSafeWallet: false,
    inputAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '1'),
    outputAmount: CurrencyAmount.fromRawAmount(USDT_BASE, '1'),
  },
} as never as TradeFlowContext

const solanaContextMock = {
  context: {
    inputAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '1'),
    outputAmount: CurrencyAmount.fromRawAmount(USDT_BASE, '1'),
    receiver: solanaAccount,
    orderKind: 'sell',
    chainId: SupportedChainId.SOLANA,
    validTo: 1700000000,
  },
} as never as SolanaTradeFlowContext

const priceImpactMock: PriceImpact = { priceImpact: undefined, loading: false }

function buildTradeConfirmActions(): TradeConfirmActions {
  return {
    onSign: jest.fn(),
    onError: jest.fn(),
    onSuccess: jest.fn(),
    onDismiss: jest.fn(),
    onOpen: jest.fn(),
    setConfirming: jest.fn(),
    requestPermitSignature: jest.fn(),
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <WithMockedWeb3>
      <WithModalProvider>{children}</WithModalProvider>
    </WithMockedWeb3>
  )
}

describe('useLimitOrdersTradeCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockTradeFlow.mockResolvedValue('0xOrderHash')
    mockSafeBundleFlow.mockResolvedValue('0xOrderHash')
    mockSolanaFlow.mockResolvedValue(true)
    mockCallWidgetHook.mockResolvedValue(true)
    mockUseTradeFlowParams.mockReturnValue(tradeFlowParamsMock)
    mockUseSafeBundleFlowContext.mockReturnValue(null)
    mockUseTradeFlowContext.mockReturnValue(tradeContextMock)
    mockUseSolanaTradeFlowContext.mockReturnValue(null)
    mockUseIsSafeApprovalBundle.mockReturnValue(false)
    // Default to an EVM chain - Solana-branch tests below override this to a Solana chainId themselves.
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as never)
  })

  function renderTradeCallback(
    tradeConfirmActions: TradeConfirmActions = buildTradeConfirmActions(),
  ): RenderHookResult<() => Promise<string | true | undefined>, unknown> {
    return renderHook(
      () => useLimitOrdersTradeCallback(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper },
    )
  }

  it('returns undefined without calling any flow when neither a Solana nor an EVM context is available', async () => {
    mockUseTradeFlowContext.mockReturnValue(null)
    mockUseSolanaTradeFlowContext.mockReturnValue(null)

    const { result } = renderTradeCallback()

    await expect(result.current()).resolves.toBeUndefined()

    expect(mockCallWidgetHook).not.toHaveBeenCalled()
    expect(mockTradeFlow).not.toHaveBeenCalled()
    expect(mockSafeBundleFlow).not.toHaveBeenCalled()
    expect(mockSolanaFlow).not.toHaveBeenCalled()
  })

  it('returns undefined and calls no flow when the widget hook declines the trade', async () => {
    mockCallWidgetHook.mockResolvedValue(false)

    const { result } = renderTradeCallback()

    await expect(result.current()).resolves.toBeUndefined()

    expect(mockTradeFlow).not.toHaveBeenCalled()
    expect(mockSafeBundleFlow).not.toHaveBeenCalled()
    expect(mockSolanaFlow).not.toHaveBeenCalled()
  })

  describe('Solana branch', () => {
    beforeEach(() => {
      mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.SOLANA, account: solanaAccount } as never)
      mockUseSolanaTradeFlowContext.mockReturnValue(solanaContextMock)
      // On a Solana chain, useTradeFlowContext (EVM-only) always resolves null.
      mockUseTradeFlowContext.mockReturnValue(null)
    })

    it('dispatches to solanaFlow, not tradeFlow or safeBundleFlow', async () => {
      const { result } = renderTradeCallback()

      await result.current()

      expect(mockSolanaFlow).toHaveBeenCalledWith(solanaContextMock, expect.anything())
      expect(mockTradeFlow).not.toHaveBeenCalled()
      expect(mockSafeBundleFlow).not.toHaveBeenCalled()
    })

    it('resolves true when solanaFlow reports the order was placed', async () => {
      mockSolanaFlow.mockResolvedValue(true)

      const { result } = renderTradeCallback()

      await expect(result.current()).resolves.toBe(true)
    })

    it('resolves undefined when solanaFlow does not report success', async () => {
      mockSolanaFlow.mockResolvedValue(undefined)

      const { result } = renderTradeCallback()

      await expect(result.current()).resolves.toBeUndefined()
    })

    it('takes precedence over the safe-bundle flow even if a stale EVM context would otherwise qualify for one', async () => {
      mockUseIsSafeApprovalBundle.mockReturnValue(true)
      // A leftover/stale EVM tradeContext with isSafeWallet: true would make shouldUseSafeBundle true if
      // the `!isSolana` guard were ever dropped from its computation - Solana must still win.
      mockUseTradeFlowContext.mockReturnValue({
        ...tradeContextMock,
        postOrderParams: { ...tradeContextMock.postOrderParams, isSafeWallet: true },
      } as never)
      mockUseSafeBundleFlowContext.mockReturnValue({ postOrderParams: { isSafeWallet: true } } as never)

      const { result } = renderTradeCallback()

      await result.current()

      expect(mockSolanaFlow).toHaveBeenCalled()
      expect(mockSafeBundleFlow).not.toHaveBeenCalled()
      expect(mockTradeFlow).not.toHaveBeenCalled()
    })

    it("builds the widget-hook payload from the Solana context's own fields", async () => {
      const { result } = renderTradeCallback()

      await result.current()

      expect(mockCallWidgetHook).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          orderType: 'LIMIT',
          orderKind: 'sell',
          chainId: SupportedChainId.SOLANA,
          validTo: 1700000000,
        }),
      )
    })
  })

  describe('EVM branch', () => {
    it('uses the regular tradeFlow when no safe bundle is required', async () => {
      const { result } = renderTradeCallback()

      await result.current()

      expect(mockTradeFlow).toHaveBeenCalledWith(tradeContextMock, tradeFlowParamsMock)
      expect(mockSafeBundleFlow).not.toHaveBeenCalled()
      expect(mockSolanaFlow).not.toHaveBeenCalled()
    })

    it('resolves with the order id tradeFlow returns', async () => {
      mockTradeFlow.mockResolvedValue('0xSomeOrderId')

      const { result } = renderTradeCallback()

      await expect(result.current()).resolves.toBe('0xSomeOrderId')
    })

    it('uses the safe-bundle flow when isSafeBundle, isSafeWallet and no permit are all true', async () => {
      mockUseIsSafeApprovalBundle.mockReturnValue(true)
      mockUseTradeFlowContext.mockReturnValue({
        ...tradeContextMock,
        postOrderParams: { ...tradeContextMock.postOrderParams, isSafeWallet: true },
      } as never)
      const safeBundleContextMock = { postOrderParams: { isSafeWallet: true } } as never
      mockUseSafeBundleFlowContext.mockReturnValue(safeBundleContextMock)

      const { result } = renderTradeCallback()

      await result.current()

      expect(mockSafeBundleFlow).toHaveBeenCalledWith(safeBundleContextMock, tradeFlowParamsMock)
      expect(mockTradeFlow).not.toHaveBeenCalled()
    })

    it('uses the regular tradeFlow instead of a safe bundle when the wallet supports permit', async () => {
      mockUseIsSafeApprovalBundle.mockReturnValue(true)
      mockUseTradeFlowContext.mockReturnValue({
        ...tradeContextMock,
        allowsOffchainSigning: true,
        permitInfo: { type: 'eip-2612', name: 'USDC', version: '2' },
        postOrderParams: { ...tradeContextMock.postOrderParams, isSafeWallet: true },
      } as never)
      mockUseSafeBundleFlowContext.mockReturnValue({ postOrderParams: { isSafeWallet: true } } as never)

      const { result } = renderTradeCallback()

      await result.current()

      expect(mockTradeFlow).toHaveBeenCalled()
      expect(mockSafeBundleFlow).not.toHaveBeenCalled()
    })

    it("builds the widget-hook payload from the trade context's own fields", async () => {
      const { result } = renderTradeCallback()

      await result.current()

      expect(mockCallWidgetHook).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          orderType: 'LIMIT',
          orderKind: 'sell',
          chainId: SupportedChainId.MAINNET,
          validTo: 1700000000,
        }),
      )
    })

    it('leaves validTo undefined when the trade context has no quoteState yet', async () => {
      mockUseTradeFlowContext.mockReturnValue({ ...tradeContextMock, quoteState: undefined } as never)

      const { result } = renderTradeCallback()

      await result.current()

      expect(mockCallWidgetHook).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ validTo: undefined }),
      )
    })
  })

  it('recomputes the callback when its inputs change, and stays stable otherwise', async () => {
    const tradeConfirmActions = buildTradeConfirmActions()
    const { result, rerender } = renderHook(
      () => useLimitOrdersTradeCallback(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
      { wrapper },
    )

    const firstCallback = result.current
    rerender()
    expect(result.current).toBe(firstCallback)

    mockUseSafeBundleFlowContext.mockReturnValue({ postOrderParams: { isSafeWallet: true } } as never)
    rerender()

    await waitFor(() => {
      expect(result.current).not.toBe(firstCallback)
    })
  })
})
