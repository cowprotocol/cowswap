import { getDefaultStore } from 'jotai'

import { act, renderHook } from '@testing-library/react'

import { callWidgetHook } from 'modules/injectedWidget'
import { tradeConfirmStateAtom } from 'modules/trade'

import { TradeAmounts } from 'common/types'

import { useHandleSwap } from './useHandleSwap'
import { useTradeFlowContext } from './useTradeFlowContext'
import { useTradeFlowType } from './useTradeFlowType'

import { swapFlow } from '../services/swapFlow'
import { FlowType } from '../types/TradeFlowContext'

jest.mock('wagmi', () => ({ useConfig: jest.fn() }))
jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: () => ({}) }))
jest.mock('modules/ethFlow', () => ({ ethFlow: jest.fn(), useEthFlowContext: jest.fn() }))
jest.mock('modules/injectedWidget', () => ({
  buildTradeWidgetHookPayload: jest.fn(),
  callWidgetHook: jest.fn(),
}))
jest.mock('modules/trade', () => ({
  ...jest.requireActual('modules/trade/state/tradeConfirmStateAtom'),
  logTradeFlow: jest.fn(),
  useDerivedTradeState: jest.fn(),
  useTradeFlowAnalytics: jest.fn(),
  useTradePriceImpact: jest.fn(),
}))
jest.mock('common/hooks/useConfirmPriceImpactWithoutFee', () => ({
  useConfirmPriceImpactWithoutFee: () => ({ confirmPriceImpactWithoutFee: jest.fn() }),
}))
jest.mock('common/utils/getAreBridgeCurrencies', () => ({ getAreBridgeCurrencies: () => false }))
jest.mock('./useSafeBundleFlowContext', () => ({ useSafeBundleFlowContext: jest.fn() }))
jest.mock('./useSolanaTradeFlowContext', () => ({ useSolanaTradeFlowContext: jest.fn() }))
jest.mock('./useTradeFlowContext', () => ({ useTradeFlowContext: jest.fn() }))
jest.mock('./useTradeFlowType', () => ({ useTradeFlowType: jest.fn() }))
jest.mock('../services/safeBundleFlow', () => ({ safeBundleApprovalFlow: jest.fn(), safeBundleEthFlow: jest.fn() }))
jest.mock('../services/solanaFlow', () => ({ solanaFlow: jest.fn() }))
jest.mock('../services/swapFlow', () => ({ swapFlow: jest.fn() }))

const mockSwapFlow = swapFlow as jest.MockedFunction<typeof swapFlow>
const store = getDefaultStore()

function setModalOpen(isOpen: boolean): void {
  const state = store.get(tradeConfirmStateAtom)
  store.set(tradeConfirmStateAtom, { ...state, isOpen, sessionId: state.sessionId + 1 })
}

const tradeFlowContext = {
  context: { inputAmount: { currency: {} }, outputAmount: { currency: {} } },
  tradeFlowAnalyticsContext: {},
  orderParams: {},
  tradeConfirmActions: {
    onSign: jest.fn(),
    onError: jest.fn(),
    onSuccess: jest.fn(),
    requestPermitSignature: jest.fn(),
  },
}

const widgetActions = {
  onUserInput: jest.fn(),
  onChangeRecipient: jest.fn(),
  onCurrencySelection: jest.fn(),
  onSwitchTokens: jest.fn(),
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function renderUseHandleSwap() {
  return renderHook(() => useHandleSwap({ deadline: 0 }, widgetActions))
}

describe('useHandleSwap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTradeFlowContext as jest.Mock).mockReturnValue(tradeFlowContext)
    ;(useTradeFlowType as jest.Mock).mockReturnValue(FlowType.REGULAR)
    ;(callWidgetHook as jest.Mock).mockResolvedValue(true)
    setModalOpen(false)
    setModalOpen(true)
    mockSwapFlow.mockReturnValue(new Promise(() => undefined))
  })

  it('ignores a second confirm while the first flow is still pending', async () => {
    const { result } = renderUseHandleSwap()

    await act(async () => {
      void result.current.callback()
      void result.current.callback()
    })

    expect(mockSwapFlow).toHaveBeenCalledTimes(1)
  })

  it('accepts a new confirm after the modal was dismissed while the wallet request never settles', async () => {
    const { result } = renderUseHandleSwap()

    await act(async () => {
      void result.current.callback()
    })

    setModalOpen(false)
    setModalOpen(true)

    await act(async () => {
      void result.current.callback()
    })

    expect(mockSwapFlow).toHaveBeenCalledTimes(2)
  })
  it('does not start the wallet flow when the modal was dismissed while the widget hook was pending', async () => {
    let resolveWidgetHook: (passed: boolean) => void = () => undefined
    ;(callWidgetHook as jest.Mock).mockReturnValueOnce(new Promise((resolve) => (resolveWidgetHook = resolve)))
    const { result } = renderUseHandleSwap()

    await act(async () => {
      void result.current.callback()
    })

    setModalOpen(false)

    await act(async () => {
      resolveWidgetHook(true)
    })

    expect(mockSwapFlow).not.toHaveBeenCalled()
  })

  it('does not reset the form when a dismissed flow settles late', async () => {
    let resolveSwapFlow: (result: boolean) => void = () => undefined
    mockSwapFlow.mockReturnValueOnce(new Promise((resolve) => (resolveSwapFlow = resolve)))
    const { result } = renderUseHandleSwap()

    await act(async () => {
      void result.current.callback()
    })

    setModalOpen(false)

    await act(async () => {
      resolveSwapFlow(true)
    })

    expect(widgetActions.onUserInput).not.toHaveBeenCalled()
    expect(widgetActions.onChangeRecipient).not.toHaveBeenCalled()
  })
  it('resets the form after a successful flow', async () => {
    mockSwapFlow.mockResolvedValueOnce(true)
    const { result } = renderUseHandleSwap()

    await act(async () => {
      await result.current.callback()
    })

    expect(widgetActions.onUserInput).toHaveBeenCalled()
    expect(widgetActions.onChangeRecipient).toHaveBeenCalledWith(null)
  })
  it('keeps a superseded flow from closing the newer trade or releasing its lock', async () => {
    let rejectFirstWalletRequest: () => void = () => undefined
    mockSwapFlow.mockImplementationOnce(
      (context) =>
        new Promise((resolve) => {
          rejectFirstWalletRequest = () => {
            context.tradeConfirmActions.onError('User rejected')
            resolve(false)
          }
        }),
    )
    mockSwapFlow.mockImplementationOnce((context) => {
      context.tradeConfirmActions.onSign({} as TradeAmounts)
      return new Promise(() => undefined)
    })
    const { result } = renderUseHandleSwap()

    await act(async () => {
      void result.current.callback()
    })

    setModalOpen(false)
    setModalOpen(true)

    await act(async () => {
      void result.current.callback()
    })
    await act(async () => {
      rejectFirstWalletRequest()
    })
    await act(async () => {
      void result.current.callback()
    })

    expect(tradeFlowContext.tradeConfirmActions.onSign).toHaveBeenCalledTimes(1)
    expect(tradeFlowContext.tradeConfirmActions.onError).not.toHaveBeenCalled()
    expect(mockSwapFlow).toHaveBeenCalledTimes(2)
  })

  it('ignores a wallet response from a widget that was remounted', async () => {
    let settleFirstFlow: () => void = () => undefined
    mockSwapFlow.mockImplementationOnce(
      (context) =>
        new Promise((resolve) => {
          settleFirstFlow = () => {
            context.tradeConfirmActions.onError('Old request failed')
            resolve(false)
          }
        }),
    )

    const first = renderUseHandleSwap()
    await act(async () => {
      void first.result.current.callback()
    })
    first.unmount()

    setModalOpen(false)
    setModalOpen(true)
    const second = renderUseHandleSwap()
    await act(async () => {
      void second.result.current.callback()
    })
    await act(async () => {
      settleFirstFlow()
    })

    expect(tradeFlowContext.tradeConfirmActions.onError).not.toHaveBeenCalled()
  })
})
