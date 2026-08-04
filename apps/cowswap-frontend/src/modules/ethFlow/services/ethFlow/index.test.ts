import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { EthFlowContext } from '../../types'

import { ethFlow } from './index'

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  getEthFlowContractAddresses: jest.fn().mockReturnValue('0x0000000000000000000000000000000000e10w'),
}))

jest.mock('modules/appData', () => ({
  removePermitHookFromAppData: jest.fn().mockResolvedValue({ fullAppData: '{}', doc: {} }),
}))

jest.mock('modules/orders', () => ({ emitPostedOrderEvent: jest.fn() }))

jest.mock('modules/trade/utils/addPendingOrderStep', () => ({ addPendingOrderStep: jest.fn() }))

jest.mock('modules/trade/utils/logger', () => ({ logTradeFlow: jest.fn() }))

jest.mock('modules/tradeQuote', () => ({
  assertValidBridgeRecipient: jest.fn(),
  isQuoteExpired: jest.fn().mockReturnValue(false),
}))

jest.mock('legacy/utils/trade', () => ({
  mapUnsignedOrderToOrder: jest.fn().mockReturnValue({ id: '0xorder' }),
  wrapErrorInOperatorError: (fn: () => unknown) => fn(),
}))

const ETH_FLOW_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000e10w'

describe('ethFlow - Send analytics payload', () => {
  const sellToken = new Token(1, '0x1111111111111111111111111111111111111111', 18, 'ETH', 'Ether')
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
    txHash: '0xtxhash',
    signature: '0xsig',
    signingScheme: 'eip1271',
    orderToSign: {},
  })

  function buildTradeContext(
    quoteId: number | undefined,
    allowsOffchainSigning: boolean,
  ): Parameters<typeof ethFlow>[0]['tradeContext'] {
    return {
      tradeConfirmActions: { onSign: jest.fn(), onSuccess: jest.fn(), onError: jest.fn() },
      swapFlowAnalyticsContext: {
        account: '0xaccount',
        orderType: UiOrderType.SWAP,
        marketLabel: 'ETH,BUY',
      },
      context: { chainId: 1, inputAmount, outputAmount },
      callbacks: {
        addBridgeOrder: jest.fn(),
        setSigningStep: jest.fn(),
        closeModals: jest.fn(),
        dispatch: jest.fn(),
      },
      orderParams: {
        account: '0xaccount',
        recipientAddressOrName: '0xaccount',
        recipient: '0xaccount',
        kind: 'sell',
        appData: { fullAppData: '{}', doc: {} },
        validTo: 1700000000,
        isSafeWallet: false,
        allowsOffchainSigning,
      },
      typedHooks: undefined,
      tradeQuote: {
        postSwapOrderFromQuote,
        quoteResults: {
          quoteResponse: {
            id: quoteId,
            quote: { feeAmount: '0' },
          },
        },
      },
      tradeQuoteState: {},
      bridgeQuoteAmounts: null,
    } as unknown as Parameters<typeof ethFlow>[0]['tradeContext']
  }

  const ethFlowContext = {
    contract: { address: ETH_FLOW_CONTRACT_ADDRESS },
    addTransaction: jest.fn(),
    checkEthFlowOrderExists: jest.fn(),
    addInFlightOrderId: jest.fn(),
  } as unknown as EthFlowContext

  function runEthFlow(quoteId: number | undefined, allowsOffchainSigning: boolean): Promise<void | boolean> {
    return ethFlow({
      tradeContext: buildTradeContext(quoteId, allowsOffchainSigning),
      ethFlowContext,
      priceImpactParams: { priceImpact: undefined } as never,
      confirmPriceImpactWithoutFee: jest.fn().mockResolvedValue(true),
      analytics: analytics as never,
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    postSwapOrderFromQuote.mockResolvedValue({
      orderId: '0xorder',
      txHash: '0xtxhash',
      signature: '0xsig',
      signingScheme: 'eip1271',
      orderToSign: {},
    })
  })

  it('propagates quoteId and allowsOffchainSigning on the Send analytics event', async () => {
    await runEthFlow(123, true)

    expect(analytics.trade).toHaveBeenCalledWith(expect.objectContaining({ quoteId: 123, allowsOffchainSigning: true }))
  })
})
