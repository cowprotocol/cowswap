import { OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { OrderStatus } from 'legacy/state/orders/actions'

import * as addPendingOrderStepModule from 'modules/trade/utils/addPendingOrderStep'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { SolanaTradeFlowContext } from '../../types/TradeFlowContext'

import { solanaFlow } from './index'

jest.mock('modules/trade/utils/addPendingOrderStep')

// Canonical Solana System Program address (32 zero bytes) — always a syntactically
// valid Solana pubkey, used here as a stand-in "connected account".
const SOLANA_ACCOUNT = '11111111111111111111111111111111'
const SOLANA_CHAIN_ID = SupportedChainId.SOLANA
const inputToken = new Token(SOLANA_CHAIN_ID, 'So11111111111111111111111111111111111111112', 9, 'SOL')
const outputToken = new Token(SOLANA_CHAIN_ID, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')
const inputAmount = CurrencyAmount.fromRawAmount(inputToken, '1000000000')
const outputAmount = CurrencyAmount.fromRawAmount(outputToken, '150000000')

function buildAnalytics(): TradeFlowAnalytics {
  return {
    trade: jest.fn(),
    sign: jest.fn(),
    approveAndPresign: jest.fn(),
    placeAdvancedOrder: jest.fn(),
    wrapApproveAndPresign: jest.fn(),
    error: jest.fn(),
  }
}

function buildContext(postSwapOrderFromQuote: jest.Mock): SolanaTradeFlowContext {
  return {
    account: SOLANA_ACCOUNT,
    tradeQuote: {
      quoteResults: {
        quoteResponse: {
          quote: {
            sellToken: inputToken.address,
            buyToken: outputToken.address,
            receiver: null,
            sellAmount: inputAmount.quotient.toString(),
            buyAmount: outputAmount.quotient.toString(),
            validTo: Math.floor(Date.now() / 1000) + 600,
            appData: '{}',
            feeAmount: '0',
            kind: OrderKind.SELL,
            partiallyFillable: false,
          },
        },
      },
      postSwapOrderFromQuote,
    } as unknown as SolanaTradeFlowContext['tradeQuote'],
    context: {
      chainId: SOLANA_CHAIN_ID,
      inputAmount,
      outputAmount,
      orderKind: OrderKind.SELL,
      validTo: Math.floor(Date.now() / 1000) + 600,
    },
    callbacks: {
      closeModals: jest.fn(),
      dispatch: jest.fn(),
      addTransaction: jest.fn(),
    },
    tradeConfirmActions: {
      onSign: jest.fn(),
      onError: jest.fn(),
      onSuccess: jest.fn(),
      onOpen: jest.fn(),
      requestPermitSignature: jest.fn(),
      onDismiss: jest.fn(),
    },
    swapFlowAnalyticsContext: {
      account: SOLANA_ACCOUNT,
      orderType: UiOrderType.SWAP,
      marketLabel: 'SOL,USDC',
    },
  }
}

describe('solanaFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('posts the order, tracks the transaction, adds a pending order, and reports success', async () => {
    const postSwapOrderFromQuote = jest.fn().mockResolvedValue({
      orderId: 'order-uid-123',
      txHash: 'tx-signature-abc',
      signingScheme: SigningScheme.PRESIGN,
      signature: 'tx-signature-abc',
    })
    const context = buildContext(postSwapOrderFromQuote)
    const analytics = buildAnalytics()

    const result = await solanaFlow(context, analytics)

    expect(result).toBe(true)
    expect(postSwapOrderFromQuote).toHaveBeenCalledWith()
    expect(context.callbacks.addTransaction).toHaveBeenCalledWith(expect.objectContaining({ hash: 'tx-signature-abc' }))
    expect(addPendingOrderStepModule.addPendingOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'order-uid-123',
        chainId: SOLANA_CHAIN_ID,
        isSafeWallet: false,
        order: expect.objectContaining({
          id: 'order-uid-123',
          owner: context.account,
          status: OrderStatus.CREATING,
          orderCreationHash: 'tx-signature-abc',
          signingScheme: SigningScheme.PRESIGN,
        }),
      }),
      context.callbacks.dispatch,
    )
    expect(context.tradeConfirmActions.onSuccess).toHaveBeenCalledWith('tx-signature-abc')
    expect(context.tradeConfirmActions.onError).not.toHaveBeenCalled()
    expect(analytics.trade).toHaveBeenCalledWith(context.swapFlowAnalyticsContext)
    expect(analytics.sign).toHaveBeenCalledWith(context.swapFlowAnalyticsContext)
  })

  it('reports an error and adds nothing when postSwapOrderFromQuote rejects', async () => {
    const postSwapOrderFromQuote = jest.fn().mockRejectedValue(new Error('User rejected the request'))
    const context = buildContext(postSwapOrderFromQuote)
    const analytics = buildAnalytics()

    const result = await solanaFlow(context, analytics)

    expect(result).toBeUndefined()
    expect(context.callbacks.addTransaction).not.toHaveBeenCalled()
    expect(addPendingOrderStepModule.addPendingOrderStep).not.toHaveBeenCalled()
    expect(context.tradeConfirmActions.onSuccess).not.toHaveBeenCalled()
    expect(context.tradeConfirmActions.onError).toHaveBeenCalled()
    expect(analytics.error).toHaveBeenCalled()
  })
})
