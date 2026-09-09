import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { Connection, PublicKey } from '@solana/web3.js'

import { OrderStatus } from 'legacy/state/orders/actions'

import { planCreateOrderStep } from 'modules/trade/services/solanaFlow/planCreateOrderStep'
import { planDelegateStep } from 'modules/trade/services/solanaFlow/planDelegateStep'
import { planWrapStep } from 'modules/trade/services/solanaFlow/planWrapStep'
import { sendSolanaFlow } from 'modules/trade/services/solanaFlow/sendSolanaFlow'
import { SolanaFlowStep } from 'modules/trade/services/solanaFlow/types'
import * as addPendingOrderStepModule from 'modules/trade/utils/addPendingOrderStep'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { SolanaTradeFlowContext } from '../../types/TradeFlowContext'

import { solanaFlow } from './index'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

jest.mock('modules/trade/utils/addPendingOrderStep')

// The step planners are unit-tested on their own; mocking them here keeps this a test of the flow's
// composition, and keeps the real instruction builders (which need ed25519 curve math jsdom can't run)
// out of this suite.
jest.mock('modules/trade/services/solanaFlow/sendSolanaFlow', () => ({ sendSolanaFlow: jest.fn() }))
jest.mock('modules/trade/services/solanaFlow/planWrapStep', () => ({ planWrapStep: jest.fn() }))
jest.mock('modules/trade/services/solanaFlow/planDelegateStep', () => ({ planDelegateStep: jest.fn() }))
jest.mock('modules/trade/services/solanaFlow/planCreateOrderStep', () => ({ planCreateOrderStep: jest.fn() }))

const mockSendSolanaFlow = sendSolanaFlow as jest.MockedFunction<typeof sendSolanaFlow>
const mockPlanWrapStep = planWrapStep as jest.MockedFunction<typeof planWrapStep>
const mockPlanDelegateStep = planDelegateStep as jest.MockedFunction<typeof planDelegateStep>
const mockPlanCreateOrderStep = planCreateOrderStep as jest.MockedFunction<typeof planCreateOrderStep>

// Canonical Solana System Program address (32 zero bytes) — always a syntactically
// valid Solana pubkey, used here as a stand-in "connected account".
const SOLANA_ACCOUNT = '11111111111111111111111111111111'
const SOLANA_CHAIN_ID = SupportedChainId.SOLANA
const TX_HASH = 'tx-signature-abc'
const SELL_AMOUNT = 1_000_000_000n

const step = (summary: string): SolanaFlowStep => ({ instructions: [], summary })
const WRAP_STEP = step('Wrap 1 SOL')
const DELEGATE_STEP = step('Approve WSOL')
const ORDER_STEP = step('Swap SOL for USDC')
const ORDER_ID = '0xdeadbeef'

const wsol = new TokenWithLogo(
  undefined,
  SOLANA_CHAIN_ID,
  'So11111111111111111111111111111111111111112',
  9,
  'WSOL',
  'Wrapped SOL',
)
const usdc = new Token(SOLANA_CHAIN_ID, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')
const nativeSol = NATIVE_CURRENCIES[SupportedChainId.SOLANA]
const outputAmount = CurrencyAmount.fromRawAmount(usdc, '150000000')

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

function buildContext({ isNativeSell = true, delegationAmount = SELL_AMOUNT } = {}): SolanaTradeFlowContext {
  const sellCurrency = isNativeSell ? nativeSol : wsol
  const inputAmount = CurrencyAmount.fromRawAmount(sellCurrency, SELL_AMOUNT.toString())

  return {
    account: SOLANA_ACCOUNT,
    solanaQuote: {
      uid: new Uint8Array(32).fill(7),
      orderPda: new PublicKey(new Uint8Array(32).fill(4)),
      programId: new PublicKey(new Uint8Array(32).fill(5)),
      intent: { owner: new PublicKey(SOLANA_ACCOUNT) },
    } as unknown as SolanaTradeFlowContext['solanaQuote'],
    solana: {
      connection: {} as Connection,
      provider: {} as SolanaProvider,
      owner: new PublicKey(SOLANA_ACCOUNT),
    },
    sellToken: wsol,
    sellAmount: SELL_AMOUNT,
    currentDelegation: 0n,
    delegationAmount,
    tradeQuote: {
      quoteResults: {
        quoteResponse: {
          quote: {
            sellToken: wsol.address,
            buyToken: usdc.address,
            receiver: null,
            sellAmount: SELL_AMOUNT.toString(),
            buyAmount: outputAmount.quotient.toString(),
            validTo: Math.floor(Date.now() / 1000) + 600,
            appData: '{}',
            feeAmount: '0',
            kind: OrderKind.SELL,
            partiallyFillable: false,
          },
        },
      },
      postSwapOrderFromQuote: jest.fn(),
    } as unknown as SolanaTradeFlowContext['tradeQuote'],
    context: {
      chainId: SOLANA_CHAIN_ID,
      inputAmount,
      outputAmount,
      orderKind: OrderKind.SELL,
      validTo: Math.floor(Date.now() / 1000) + 600,
      receiver: 'ReceiverSolanaAddress1111111111111111111111',
    },
    callbacks: {
      closeModals: jest.fn(),
      dispatch: jest.fn() as unknown as SolanaTradeFlowContext['callbacks']['dispatch'],
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

function sentSteps(): SolanaFlowStep[] {
  return mockSendSolanaFlow.mock.calls[0][1]
}

describe('solanaFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSendSolanaFlow.mockResolvedValue({ hash: TX_HASH })
    mockPlanWrapStep.mockReturnValue(WRAP_STEP)
    mockPlanDelegateStep.mockReturnValue(DELEGATE_STEP)
    mockPlanCreateOrderStep.mockResolvedValue({
      step: ORDER_STEP,
      orderId: ORDER_ID,
      signingScheme: SigningScheme.PRESIGN,
    })
  })

  it('bundles wrap, delegate and create-order into a single transaction', async () => {
    const context = buildContext({ isNativeSell: true })

    const result = await solanaFlow(context, buildAnalytics())

    expect(result).toBe(true)
    expect(mockSendSolanaFlow).toHaveBeenCalledTimes(1)
    expect(sentSteps()).toEqual([WRAP_STEP, DELEGATE_STEP, ORDER_STEP])
  })

  it('passes the full sell amount to the wrap planner for a native SOL sell', async () => {
    await solanaFlow(buildContext({ isNativeSell: true }), buildAnalytics())

    expect(mockPlanWrapStep).toHaveBeenCalledWith(expect.objectContaining({ sellAmount: SELL_AMOUNT }))
  })

  it('delegates the amount the approve switcher chose, not the sell amount', async () => {
    const unlimited = 2n ** 64n - 1n

    await solanaFlow(buildContext({ delegationAmount: unlimited }), buildAnalytics())

    expect(mockPlanDelegateStep).toHaveBeenCalledWith(expect.objectContaining({ amount: unlimited }))
  })

  it('asks for no wrapping on an SPL sell', async () => {
    await solanaFlow(buildContext({ isNativeSell: false }), buildAnalytics())

    expect(mockPlanWrapStep).toHaveBeenCalledWith(expect.objectContaining({ sellAmount: 0n }))
  })

  it('drops steps the planners skip', async () => {
    mockPlanWrapStep.mockReturnValue(null)
    mockPlanDelegateStep.mockReturnValue(null)

    await solanaFlow(buildContext(), buildAnalytics())

    expect(sentSteps()).toEqual([ORDER_STEP])
  })

  it('never posts the order from the quote', async () => {
    const context = buildContext()

    await solanaFlow(context, buildAnalytics())

    expect(context.tradeQuote.postSwapOrderFromQuote).not.toHaveBeenCalled()
  })

  it('adds a pending order and reports success', async () => {
    const context = buildContext()
    const analytics = buildAnalytics()

    await solanaFlow(context, analytics)

    expect(addPendingOrderStepModule.addPendingOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({
        id: ORDER_ID,
        chainId: SOLANA_CHAIN_ID,
        isSafeWallet: false,
        order: expect.objectContaining({
          id: ORDER_ID,
          owner: context.account,
          status: OrderStatus.CREATING,
          orderCreationHash: TX_HASH,
          signingScheme: SigningScheme.PRESIGN,
          // The local order must reflect what was actually submitted (context.receiver/validTo),
          // not the quote's own values (receiver: null in this fixture), otherwise a recipient or
          // deadline picked after quoting is missing from the order until indexing replaces it.
          receiver: context.context.receiver,
          validTo: context.context.validTo,
        }),
      }),
      context.callbacks.dispatch,
    )
    expect(context.tradeConfirmActions.onSuccess).toHaveBeenCalledWith(ORDER_ID)
    expect(context.tradeConfirmActions.onError).not.toHaveBeenCalled()
    expect(analytics.trade).toHaveBeenCalledWith(context.swapFlowAnalyticsContext)
    expect(analytics.sign).toHaveBeenCalledWith(context.swapFlowAnalyticsContext)
  })

  it('reports an error and adds nothing when sending rejects', async () => {
    mockSendSolanaFlow.mockRejectedValue(new Error('User rejected the request'))
    const context = buildContext()
    const analytics = buildAnalytics()

    const result = await solanaFlow(context, analytics)

    expect(result).toBeUndefined()
    expect(addPendingOrderStepModule.addPendingOrderStep).not.toHaveBeenCalled()
    expect(context.tradeConfirmActions.onSuccess).not.toHaveBeenCalled()
    expect(context.tradeConfirmActions.onError).toHaveBeenCalled()
    expect(analytics.error).toHaveBeenCalled()
  })
})
