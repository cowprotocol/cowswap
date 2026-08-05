import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { handlePermit } from 'modules/permit'

import { TradeFlowContext } from '../../types/TradeFlowContext'

import { swapFlow } from './index'

jest.mock('modules/permit', () => ({
  callDataContainsPermitSigner: jest.fn().mockReturnValue(false),
  handlePermit: jest.fn().mockResolvedValue({ fullAppData: '{}', doc: {} }),
}))
jest.mock('modules/injectedWidget', () => {
  class WidgetHookDeclineError extends Error {}
  return { WidgetHookDeclineError }
})
jest.mock('modules/orders', () => ({ emitPostedOrderEvent: jest.fn() }))
jest.mock('modules/trade/utils/addPendingOrderStep', () => ({ addPendingOrderStep: jest.fn() }))
jest.mock('modules/trade/utils/logger', () => ({ logTradeFlow: jest.fn() }))
jest.mock('modules/tradeQuote', () => ({ assertValidBridgeRecipient: jest.fn() }))
jest.mock('legacy/state/orders/utils', () => ({ partialOrderUpdate: jest.fn() }))
jest.mock('legacy/utils/trade', () => ({
  mapUnsignedOrderToOrder: jest.fn().mockReturnValue({ id: '0xorder' }),
  wrapErrorInOperatorError: (fn: () => unknown) => fn(),
}))
jest.mock('tradingSdk/tradingSdk', () => ({ tradingSdk: { getPreSignTransaction: jest.fn() } }))
jest.mock('wagmi/actions', () => ({ sendTransaction: jest.fn() }))

const mockHandlePermit = handlePermit as jest.MockedFunction<typeof handlePermit>

describe('swapFlow - Send analytics payload', () => {
  const sellToken = new Token(1, '0x1111111111111111111111111111111111111111', 18, 'SELL', 'Sell Token')
  const buyToken = new Token(1, '0x2222222222222222222222222222222222222222', 18, 'BUY', 'Buy Token')
  const inputAmount = CurrencyAmount.fromRawAmount(sellToken, '1000000000000000000')
  const outputAmount = CurrencyAmount.fromRawAmount(buyToken, '2000000000000000000')

  const analytics = {
    trade: jest.fn(),
    sign: jest.fn(),
    error: jest.fn(),
  }

  const postSwapOrderFromQuote = jest.fn().mockResolvedValue({
    orderId: '0xorder',
    signature: '0xsig',
    signingScheme: 'eip712',
    orderToSign: {},
  })

  function buildTradeContext(): TradeFlowContext {
    return {
      context: { chainId: 1, inputAmount, outputAmount },
      callbacks: {
        addBridgeOrder: jest.fn(),
        closeModals: jest.fn(),
        dispatch: jest.fn(),
        getCachedPermit: jest.fn().mockResolvedValue(undefined),
        setSigningStep: jest.fn(),
      },
      flags: { allowsOffchainSigning: true },
      orderParams: {
        account: '0xaccount',
        allowsOffchainSigning: true,
        appData: { fullAppData: '{}', doc: {} },
        isSafeWallet: false,
        kind: 'sell',
        quoteId: 123,
        recipient: '0xaccount',
        recipientAddressOrName: '0xaccount',
        validTo: 1700000000,
      },
      swapFlowAnalyticsContext: {
        account: '0xaccount',
        marketLabel: 'SELL,BUY',
        orderType: UiOrderType.SWAP,
      },
      tradeConfirmActions: { onError: jest.fn(), onSign: jest.fn(), onSuccess: jest.fn() },
      tradeQuote: { postSwapOrderFromQuote },
      tradeQuoteState: {},
      typedHooks: undefined,
    } as unknown as TradeFlowContext
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockHandlePermit.mockResolvedValue({ fullAppData: '{}', doc: {} } as never)
    postSwapOrderFromQuote.mockResolvedValue({
      orderId: '0xorder',
      signature: '0xsig',
      signingScheme: 'eip712',
      orderToSign: {},
    })
  })

  it('forwards quoteId and allowsOffchainSigning to the Send analytics event', async () => {
    await swapFlow(
      buildTradeContext(),
      { priceImpact: undefined } as never,
      jest.fn().mockResolvedValue(true),
      analytics as never,
    )

    expect(analytics.trade).toHaveBeenCalledWith(expect.objectContaining({ quoteId: 123, allowsOffchainSigning: true }))
  })
})
