import { WETH_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { safeBundleEthFlow } from './safeBundleEthFlow'

import { SafeBundleFlowContext, TradeFlowContext } from '../../types/TradeFlowContext'

jest.mock('modules/appData', () => ({
  removePermitHookFromAppData: jest.fn().mockResolvedValue({ fullAppData: '{}', doc: {} }),
}))

jest.mock('modules/operations/bundle/buildApproveTx', () => ({
  buildApproveTx: jest.fn().mockResolvedValue({ to: '0xapprove', data: '0xapprovedata', value: 0n }),
}))

jest.mock('modules/operations/bundle/buildWrapTx', () => ({
  buildWrapTx: jest.fn().mockReturnValue({ to: '0xwrap', data: '0xwrapdata', value: 0n }),
}))

jest.mock('modules/orders', () => ({ emitPostedOrderEvent: jest.fn() }))

jest.mock('modules/trade/utils/addPendingOrderStep', () => ({ addPendingOrderStep: jest.fn() }))

jest.mock('modules/trade/utils/logger', () => ({ logTradeFlow: jest.fn() }))

jest.mock('modules/tradeQuote', () => ({ assertValidBridgeRecipient: jest.fn() }))

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

describe('safeBundleEthFlow - Send analytics payload', () => {
  const buyToken = new Token(SupportedChainId.MAINNET, '0x2222222222222222222222222222222222222222', 18, 'BUY', 'Buy')
  const inputAmount = CurrencyAmount.fromRawAmount(WETH_MAINNET, '1000000000000000000')
  const outputAmount = CurrencyAmount.fromRawAmount(buyToken, '2000000000000000000')

  const analytics = {
    trade: jest.fn(),
    wrapApproveAndPresign: jest.fn(),
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
        marketLabel: 'WETH,BUY',
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
        allowsOffchainSigning,
        quoteId,
      },
    } as unknown as TradeFlowContext
  }

  const safeBundleContext = {
    spender: '0xspender',
    sendBatchTransactions: jest.fn().mockResolvedValue('0xsafetxhash'),
    wrappedNativeContract: { address: WETH_MAINNET.address },
    needsApproval: true,
    tokenAddress: WETH_MAINNET.address,
    amountToApprove: inputAmount,
    maximumSendSellAmount: inputAmount,
  } as unknown as SafeBundleFlowContext

  function run(quoteId: number | undefined, allowsOffchainSigning: boolean): Promise<void | boolean> {
    return safeBundleEthFlow(
      buildTradeContext(quoteId, allowsOffchainSigning),
      safeBundleContext,
      { priceImpact: undefined } as never,
      jest.fn().mockResolvedValue(true),
      analytics as never,
    )
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

  it('propagates quoteId and allowsOffchainSigning on the wrapApproveAndPresign analytics event', async () => {
    await run(123, false)

    expect(analytics.wrapApproveAndPresign).toHaveBeenCalledWith(
      expect.objectContaining({ quoteId: 123, allowsOffchainSigning: false }),
    )
  })
})
