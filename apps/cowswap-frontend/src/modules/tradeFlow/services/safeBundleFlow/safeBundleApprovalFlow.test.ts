import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { safeBundleApprovalFlow } from './safeBundleApprovalFlow'

import { SafeBundleFlowContext, TradeFlowContext } from '../../types/TradeFlowContext'

jest.mock('modules/appData', () => ({
  removePermitHookFromAppData: jest.fn().mockResolvedValue({ fullAppData: '{}', doc: {} }),
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

jest.mock('modules/tradeQuote', () => ({ assertValidBridgeRecipient: jest.fn() }))

jest.mock('modules/zeroApproval', () => ({ shouldZeroApprove: jest.fn().mockResolvedValue(false) }))

jest.mock('legacy/utils/trade', () => ({
  mapUnsignedOrderToOrder: jest.fn().mockReturnValue({ id: '0xorder' }),
  wrapErrorInOperatorError: (fn: () => unknown) => fn(),
}))

jest.mock('legacy/state/orders/utils', () => ({ partialOrderUpdate: jest.fn() }))

jest.mock('tradingSdk/tradingSdk', () => ({
  tradingSdk: {
    getPreSignTransaction: jest.fn().mockResolvedValue({ to: '0xpresign', data: '0xpresigndata', value: '0' }),
  },
}))

describe('safeBundleApprovalFlow - Send analytics payload', () => {
  const sellToken = new Token(
    SupportedChainId.MAINNET,
    '0x1111111111111111111111111111111111111111',
    18,
    'SELL',
    'Sell',
  )
  const buyToken = new Token(SupportedChainId.MAINNET, '0x2222222222222222222222222222222222222222', 18, 'BUY', 'Buy')
  const inputAmount = CurrencyAmount.fromRawAmount(sellToken, '1000000000000000000')
  const outputAmount = CurrencyAmount.fromRawAmount(buyToken, '2000000000000000000')

  const analytics = {
    trade: jest.fn(),
    approveAndPresign: jest.fn(),
    sign: jest.fn(),
    error: jest.fn(),
  }

  const postSwapOrderFromQuote = jest.fn().mockResolvedValue({
    orderId: '0xorder',
    signature: '0xsig',
    signingScheme: 'presign',
    orderToSign: {},
  })

  function buildTradeContext(quoteId: number | undefined, allowsOffchainSigning: boolean): TradeFlowContext {
    return {
      context: { chainId: SupportedChainId.MAINNET, inputAmount, outputAmount },
      callbacks: { closeModals: jest.fn(), dispatch: jest.fn(), addBridgeOrder: jest.fn() },
      swapFlowAnalyticsContext: {
        account: '0xaccount',
        orderType: UiOrderType.SWAP,
        marketLabel: 'SELL,BUY',
      },
      tradeConfirmActions: { onSign: jest.fn(), onSuccess: jest.fn(), onError: jest.fn() },
      typedHooks: undefined,
      tradeQuote: { postSwapOrderFromQuote },
      bridgeQuoteAmounts: null,
      orderParams: {
        account: '0xaccount',
        recipientAddressOrName: '0xaccount',
        recipient: '0xaccount',
        kind: 'sell',
        appData: { fullAppData: '{}', doc: {} },
        validTo: 1700000000,
        isSafeWallet: true,
        inputAmount,
        outputAmount,
        allowsOffchainSigning,
        quoteId,
      },
    } as unknown as TradeFlowContext
  }

  const safeBundleContext = {
    spender: '0xspender',
    sendBatchTransactions: jest.fn().mockResolvedValue('0xsafetxhash'),
    tokenAddress: sellToken.address,
    amountToApprove: inputAmount,
  } as unknown as SafeBundleFlowContext

  function run(quoteId: number | undefined, allowsOffchainSigning: boolean): Promise<void | boolean> {
    return safeBundleApprovalFlow({
      tradeContext: buildTradeContext(quoteId, allowsOffchainSigning),
      safeBundleContext,
      priceImpactParams: { priceImpact: undefined } as never,
      confirmPriceImpactWithoutFee: jest.fn().mockResolvedValue(true),
      analytics: analytics as never,
      config: {} as never,
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    postSwapOrderFromQuote.mockResolvedValue({
      orderId: '0xorder',
      signature: '0xsig',
      signingScheme: 'presign',
      orderToSign: {},
    })
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
