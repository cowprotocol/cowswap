import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { handlePermit } from 'modules/permit'

import { TradeFlowContext, WidgetHookDeclineError } from '../types'

import { tradeFlow } from './index'

jest.mock('modules/permit', () => ({
  handlePermit: jest.fn().mockResolvedValue({ fullAppData: '{}', doc: {} }),
  callDataContainsPermitSigner: jest.fn().mockReturnValue(false),
}))

jest.mock('modules/injectedWidget', () => {
  // The ON_BEFORE_APPROVAL veto now fires inside `handlePermit` (mocked here); the flow only needs
  // to recognise its decline error, so provide a real class for `instanceof` checks.
  class WidgetHookDeclineError extends Error {}
  return { callWidgetHook: jest.fn().mockResolvedValue(true), WidgetHookDeclineError }
})

jest.mock('tradingSdk/tradingSdk', () => ({
  tradingSdk: {
    postLimitOrder: jest.fn().mockResolvedValue({
      orderId: '0xorder',
      signature: '0xsig',
      signingScheme: 'eip712',
      orderToSign: {},
    }),
    getPreSignTransaction: jest.fn(),
  },
}))

jest.mock('wagmi/actions', () => ({ sendTransaction: jest.fn() }))

jest.mock('legacy/utils/trade', () => ({
  mapUnsignedOrderToOrder: jest.fn().mockReturnValue({ id: '0xorder' }),
  wrapErrorInOperatorError: (fn: () => unknown) => fn(),
}))

jest.mock('legacy/state/orders/utils', () => ({ partialOrderUpdate: jest.fn() }))

jest.mock('modules/orders', () => ({ emitPostedOrderEvent: jest.fn() }))

jest.mock('modules/trade/utils/addPendingOrderStep', () => ({ addPendingOrderStep: jest.fn() }))

jest.mock('modules/trade/utils/logger', () => ({ logTradeFlow: jest.fn() }))

jest.mock('modules/limitOrders/utils/calculateLimitOrdersDeadline', () => ({
  calculateLimitOrdersDeadline: () => 1700000000,
}))

const mockHandlePermit = handlePermit as jest.MockedFunction<typeof handlePermit>

describe('limit orders tradeFlow - permit amount', () => {
  const sellToken = new Token(1, '0x1111111111111111111111111111111111111111', 18, 'SELL', 'Sell Token')
  const buyToken = new Token(1, '0x2222222222222222222222222222222222222222', 18, 'BUY', 'Buy Token')
  const inputAmount = CurrencyAmount.fromRawAmount(sellToken, '1000000000000000000')
  const outputAmount = CurrencyAmount.fromRawAmount(buyToken, '2000000000000000000')

  const permitAmountToSign = 1000000000000000000n

  const analytics = {
    trade: jest.fn(),
    sign: jest.fn(),
    error: jest.fn(),
    onSignError: jest.fn(),
  }

  function buildParams(): TradeFlowContext {
    return {
      chainId: 1,
      settlementContract: { address: '0xsettlement' },
      allowsOffchainSigning: true,
      dispatch: jest.fn(),
      config: {},
      rateImpact: 0,
      permitInfo: { type: 'eip-2612', name: 'Sell Token', version: '1' },
      permitAmountToSign,
      generatePermitHook: jest.fn(),
      getCachedPermit: jest.fn(),
      quoteState: {},
      postOrderParams: {
        class: 'limit',
        kind: 'sell',
        account: '0xaccount',
        chainId: 1,
        signer: {},
        sellToken,
        buyToken,
        recipient: '0xaccount',
        recipientAddressOrName: '0xaccount',
        allowsOffchainSigning: true,
        feeAmount: CurrencyAmount.fromRawAmount(sellToken, 0),
        inputAmount,
        outputAmount,
        sellAmountBeforeFee: inputAmount,
        partiallyFillable: false,
        appData: { fullAppData: '{}', doc: {} },
        quoteId: 1,
        isSafeWallet: false,
      },
    } as unknown as TradeFlowContext
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockHandlePermit.mockResolvedValue({ fullAppData: '{}', doc: {} } as never)
  })

  function runTradeFlow(params: TradeFlowContext): Promise<unknown> {
    return tradeFlow(
      params,
      { priceImpact: undefined } as never,
      {} as never,
      analytics as never,
      jest.fn().mockResolvedValue(true),
      jest.fn().mockResolvedValue(undefined),
      jest.fn(),
    )
  }

  it('signs the permit with the bounded amount from permitAmountToSign', async () => {
    await runTradeFlow(buildParams())

    expect(mockHandlePermit).toHaveBeenCalledTimes(1)
    expect(mockHandlePermit).toHaveBeenCalledWith(expect.objectContaining({ amount: permitAmountToSign }))
  })

  it('delegates the ON_BEFORE_APPROVAL veto to handlePermit via a preSignCallback', async () => {
    // The cache lookup + widget veto + "requesting signature" UI all live inside handlePermit now;
    // the flow just hands it the beforePermit callback to flag the signing step.
    await runTradeFlow(buildParams())

    expect(mockHandlePermit).toHaveBeenCalledWith(expect.objectContaining({ preSignCallback: expect.any(Function) }))
  })

  it('rethrows WidgetHookDeclineError (without swap-error analytics) when handlePermit is declined', async () => {
    mockHandlePermit.mockRejectedValue(new WidgetHookDeclineError())

    await expect(runTradeFlow(buildParams())).rejects.toBeInstanceOf(WidgetHookDeclineError)

    expect(analytics.error).not.toHaveBeenCalled()
  })
})
