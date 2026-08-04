import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { SafeBundleFlowContext } from '../types'

import { safeBundleFlow } from './index'

jest.mock('modules/appData', () => ({
  removePermitHookFromAppData: jest.fn().mockResolvedValue({ fullAppData: '{}', doc: {} }),
}))

jest.mock('modules/limitOrders/utils/calculateLimitOrdersDeadline', () => ({
  calculateLimitOrdersDeadline: () => 1700000000,
}))

jest.mock('modules/operations/bundle/buildApproveTx', () => ({
  buildApproveTx: jest.fn().mockResolvedValue({ to: '0xapprove', data: '0xapprovedata', value: 0n }),
}))

jest.mock('modules/operations/bundle/buildZeroApproveTx', () => ({
  buildZeroApproveTx: jest.fn().mockResolvedValue({ to: '0xzeroapprove', data: '0xzeroapprovedata', value: 0n }),
}))

jest.mock('modules/orders', () => ({ emitPostedOrderEvent: jest.fn() }))

jest.mock('modules/trade/utils/addPendingOrderStep', () => ({ addPendingOrderStep: jest.fn() }))

jest.mock('modules/trade/utils/logger', () => ({ logTradeFlow: jest.fn() }))

jest.mock('modules/zeroApproval', () => ({ shouldZeroApprove: jest.fn().mockResolvedValue(false) }))

jest.mock('legacy/utils/trade', () => ({
  mapUnsignedOrderToOrder: jest.fn().mockReturnValue({ id: '0xorder' }),
  wrapErrorInOperatorError: (fn: () => unknown) => fn(),
}))

jest.mock('legacy/state/orders/utils', () => ({ partialOrderUpdate: jest.fn() }))

jest.mock('tradingSdk/tradingSdk', () => ({
  tradingSdk: {
    postLimitOrder: jest.fn().mockResolvedValue({
      orderId: '0xorder',
      signature: '0xsig',
      signingScheme: 'presign',
      orderToSign: {},
    }),
    getPreSignTransaction: jest.fn().mockResolvedValue({ to: '0xpresign', data: '0xpresigndata', value: '0' }),
  },
}))

describe('limit orders safeBundleFlow - Send analytics payload', () => {
  const sellToken = new Token(1, '0x1111111111111111111111111111111111111111', 18, 'SELL', 'Sell Token')
  const buyToken = new Token(1, '0x2222222222222222222222222222222222222222', 18, 'BUY', 'Buy Token')
  const inputAmount = CurrencyAmount.fromRawAmount(sellToken, '1000000000000000000')
  const outputAmount = CurrencyAmount.fromRawAmount(buyToken, '2000000000000000000')

  const analytics = {
    trade: jest.fn(),
    approveAndPresign: jest.fn(),
    sign: jest.fn(),
    error: jest.fn(),
  }

  function buildParams(quoteId: number | undefined, allowsOffchainSigning: boolean): SafeBundleFlowContext {
    return {
      chainId: 1,
      dispatch: jest.fn(),
      config: {},
      spender: '0xspender',
      sendBatchTransactions: jest.fn().mockResolvedValue('0xsafetxhash'),
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
        allowsOffchainSigning,
        feeAmount: CurrencyAmount.fromRawAmount(sellToken, 0),
        inputAmount,
        outputAmount,
        sellAmountBeforeFee: inputAmount,
        partiallyFillable: false,
        appData: { fullAppData: '{}', doc: {} },
        quoteId,
        isSafeWallet: true,
      },
    } as unknown as SafeBundleFlowContext
  }

  function run(quoteId: number | undefined, allowsOffchainSigning: boolean): Promise<string> {
    return safeBundleFlow({
      params: buildParams(quoteId, allowsOffchainSigning),
      priceImpact: { priceImpact: undefined } as never,
      settingsState: {} as never,
      confirmPriceImpactWithoutFee: jest.fn().mockResolvedValue(true),
      analytics: analytics as never,
      config: {} as never,
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('propagates quoteId and allowsOffchainSigning on the approveAndPresign analytics event', async () => {
    await run(123, false)

    expect(analytics.approveAndPresign).toHaveBeenCalledWith(
      expect.objectContaining({ quoteId: 123, allowsOffchainSigning: false }),
    )
  })

  it('omits quoteId on the approveAndPresign analytics event when the quote id is unavailable', async () => {
    await run(undefined, false)

    expect(analytics.approveAndPresign).toHaveBeenCalledWith(
      expect.objectContaining({ quoteId: undefined, allowsOffchainSigning: false }),
    )
  })
})
