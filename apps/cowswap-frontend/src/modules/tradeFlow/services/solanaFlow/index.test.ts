import { TokenWithLogo } from '@cowprotocol/common-const'
import { LATEST_APP_DATA_VERSION, OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { Connection, PublicKey } from '@solana/web3.js'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { AppDataInfo } from 'modules/appData'
import { emitPostedOrderEvent } from 'modules/orders'
import { planCreateBuyAtaStep } from 'modules/trade/services/solanaFlow/planCreateBuyAtaStep'
import { planCreateLimitOrderStep } from 'modules/trade/services/solanaFlow/planCreateLimitOrderStep'
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
jest.mock('modules/orders', () => ({ emitPostedOrderEvent: jest.fn() }))

// The step planners are unit-tested on their own; mocking them here keeps this a test of the flow's
// composition, and keeps the real instruction builders (which need ed25519 curve math jsdom can't run)
// out of this suite.
jest.mock('modules/trade/services/solanaFlow/sendSolanaFlow', () => ({ sendSolanaFlow: jest.fn() }))
jest.mock('modules/trade/services/solanaFlow/planWrapStep', () => ({ planWrapStep: jest.fn() }))
jest.mock('modules/trade/services/solanaFlow/planDelegateStep', () => ({ planDelegateStep: jest.fn() }))
jest.mock('modules/trade/services/solanaFlow/planCreateBuyAtaStep', () => ({ planCreateBuyAtaStep: jest.fn() }))
jest.mock('modules/trade/services/solanaFlow/planCreateOrderStep', () => ({ planCreateOrderStep: jest.fn() }))
jest.mock('modules/trade/services/solanaFlow/planCreateLimitOrderStep', () => ({ planCreateLimitOrderStep: jest.fn() }))

const mockSendSolanaFlow = sendSolanaFlow as jest.MockedFunction<typeof sendSolanaFlow>
const mockPlanWrapStep = planWrapStep as jest.MockedFunction<typeof planWrapStep>
const mockPlanDelegateStep = planDelegateStep as jest.MockedFunction<typeof planDelegateStep>
const mockPlanCreateBuyAtaStep = planCreateBuyAtaStep as jest.MockedFunction<typeof planCreateBuyAtaStep>
const mockPlanCreateOrderStep = planCreateOrderStep as jest.MockedFunction<typeof planCreateOrderStep>
const mockPlanCreateLimitOrderStep = planCreateLimitOrderStep as jest.MockedFunction<typeof planCreateLimitOrderStep>
const mockEmitPostedOrderEvent = emitPostedOrderEvent as jest.MockedFunction<typeof emitPostedOrderEvent>

// Canonical Solana System Program address (32 zero bytes) — always a syntactically
// valid Solana pubkey, used here as a stand-in "connected account".
const SOLANA_ACCOUNT = '11111111111111111111111111111111'
const RECEIVER_ADDRESS = '5k75h1UBx8gJp6kTkPcbkgAgPmrPBiLHLLXmzMfVsBEZ'
// The flow's own freshly-resolved receiver — deliberately distinct from RECEIVER_ADDRESS (the quote's,
// possibly-stale one) so tests can tell which one a given code path actually used. Must be a real,
// parseable base58 pubkey: `solanaFlow` now passes it through `new PublicKey(...)` for limit orders.
const RESOLVED_RECEIVER_ADDRESS = new PublicKey(new Uint8Array(32).fill(6)).toBase58()
const SOLANA_CHAIN_ID = SupportedChainId.SOLANA
const TX_HASH = 'tx-signature-abc'
const SELL_AMOUNT = 1_000_000_000n

const step = (summary: string): SolanaFlowStep => ({ instructions: [], summary })
const WRAP_STEP = step('Wrap 1 SOL')
const DELEGATE_STEP = step('Approve WSOL')
const BUY_ATA_STEP = step('Create USDC account')
const ORDER_STEP = step('Swap SOL for USDC')
const ORDER_ID = '0xdeadbeef'
// Distinct fixture hex strings standing in for whatever each planner actually signed — real values would
// be the pre-agreed Solana appData constants (see common/constants/solanaAppData.ts), but this test only
// needs to confirm the planner's own return value reaches the local order, not that specific bytes.
const MARKET_APP_DATA_HEX = '0x' + 'aa'.repeat(32)
const LIMIT_APP_DATA_HEX = '0x' + 'bb'.repeat(32)
// Deliberately different from solanaQuote.intent's amounts (1_000_000n/1_900_000n) and from each other:
// a limit order's actually-signed price must never be confused with the market quote's or with a swap's.
const MARKET_SIGNED_SELL_AMOUNT = 1_000_000n
const MARKET_SIGNED_BUY_AMOUNT = 1_900_000n
const LIMIT_SIGNED_SELL_AMOUNT = 5_000_000n
const LIMIT_SIGNED_BUY_AMOUNT = 12_000_000n

const wsol = new TokenWithLogo(
  undefined,
  SOLANA_CHAIN_ID,
  'So11111111111111111111111111111111111111112',
  9,
  'WSOL',
  'Wrapped SOL',
)
const usdc = new Token(SOLANA_CHAIN_ID, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')

const APP_DATA: AppDataInfo = {
  doc: { version: LATEST_APP_DATA_VERSION, appCode: 'CoW Swap', metadata: {} },
  fullAppData: '{}',
  appDataKeccak256: '0x' + '0'.repeat(64),
}
const outputAmount = CurrencyAmount.fromRawAmount(usdc, '150000000')
// The quote always reports its sellToken as WSOL, even for a native sell — see `getSolanaSellToken`.
const inputAmount = CurrencyAmount.fromRawAmount(wsol, SELL_AMOUNT.toString())

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

function buildContext({
  isNativeSell = true,
  delegationAmount = SELL_AMOUNT,
  orderClass = OrderClass.MARKET,
}: { isNativeSell?: boolean; delegationAmount?: bigint; orderClass?: OrderClass } = {}): SolanaTradeFlowContext {
  return {
    account: SOLANA_ACCOUNT,
    isNativeSell,
    solanaQuote: {
      uid: new Uint8Array(32).fill(7),
      orderPda: new PublicKey(new Uint8Array(32).fill(4)),
      programId: new PublicKey(new Uint8Array(32).fill(5)),
      // Post-slippage amounts: these are what gets signed on chain, and what the stored order must carry.
      intent: { owner: new PublicKey(SOLANA_ACCOUNT), sellAmount: 1_000_000n, buyAmount: 1_900_000n },
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
    appData: APP_DATA,
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
        // The receiver the quote derived `intent.buyTokenAccount` from — the buy-ATA step must use this
        // one, not `context.receiver`, or it would name an account the order does not credit.
        tradeParameters: { receiver: RECEIVER_ADDRESS },
      },
      postSwapOrderFromQuote: jest.fn(),
    } as unknown as SolanaTradeFlowContext['tradeQuote'],
    context: {
      chainId: SOLANA_CHAIN_ID,
      inputAmount,
      outputAmount,
      orderKind: OrderKind.SELL,
      validTo: Math.floor(Date.now() / 1000) + 600,
      receiver: RESOLVED_RECEIVER_ADDRESS,
      orderClass,
      partiallyFillable: false,
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
      setConfirming: jest.fn(),
    },
    tradeFlowAnalyticsContext: {
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
    mockPlanCreateBuyAtaStep.mockReturnValue(BUY_ATA_STEP)
    mockPlanCreateOrderStep.mockResolvedValue({
      step: ORDER_STEP,
      orderId: ORDER_ID,
      signingScheme: SigningScheme.PRESIGN,
      appData: MARKET_APP_DATA_HEX,
      sellAmount: MARKET_SIGNED_SELL_AMOUNT,
      buyAmount: MARKET_SIGNED_BUY_AMOUNT,
    })
    mockPlanCreateLimitOrderStep.mockResolvedValue({
      step: ORDER_STEP,
      orderId: ORDER_ID,
      signingScheme: SigningScheme.PRESIGN,
      appData: LIMIT_APP_DATA_HEX,
      sellAmount: LIMIT_SIGNED_SELL_AMOUNT,
      buyAmount: LIMIT_SIGNED_BUY_AMOUNT,
    })
  })

  it('bundles wrap, delegate, buy-ATA and create-order into a single transaction', async () => {
    const context = buildContext({ isNativeSell: true })

    const result = await solanaFlow(context, buildAnalytics())

    expect(result).toBe(true)
    expect(mockSendSolanaFlow).toHaveBeenCalledTimes(1)
    expect(sentSteps()).toEqual([WRAP_STEP, DELEGATE_STEP, BUY_ATA_STEP, ORDER_STEP])
  })

  it('passes the full sell amount to the wrap planner for a native SOL sell', async () => {
    await solanaFlow(buildContext({ isNativeSell: true }), buildAnalytics())

    expect(mockPlanWrapStep).toHaveBeenCalledWith(expect.objectContaining({ sellAmount: SELL_AMOUNT }))
  })

  // The quoted intent carries the quote's own TTL, so the deadline has to be handed to the order
  // planner explicitly — otherwise the on-chain order expires at a time the UI never showed.
  it("hands the user's deadline to the order planner", async () => {
    const context = buildContext()

    await solanaFlow(context, buildAnalytics())

    expect(mockPlanCreateOrderStep).toHaveBeenCalledWith(expect.objectContaining({ validTo: context.context.validTo }))
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

  it('drops steps the planners skip, but always creates the buy account', async () => {
    mockPlanWrapStep.mockReturnValue(null)
    mockPlanDelegateStep.mockReturnValue(null)

    await solanaFlow(buildContext(), buildAnalytics())

    // The buy-ATA step has no skip condition on purpose: the instruction is idempotent, so including it
    // unconditionally is cheaper than an RPC existence check and immune to the account appearing mid-flight.
    expect(sentSteps()).toEqual([BUY_ATA_STEP, ORDER_STEP])
  })

  it('creates the buy account for the receiver the quote used, not the one resolved for the order', async () => {
    const context = buildContext()

    await solanaFlow(context, buildAnalytics())

    const [{ payer, receiver, quote }] = mockPlanCreateBuyAtaStep.mock.calls[0]
    expect(receiver.toBase58()).toBe(RECEIVER_ADDRESS)
    expect(receiver.toBase58()).not.toBe(context.context.receiver)
    expect(payer.toBase58()).toBe(SOLANA_ACCOUNT)
    expect(quote).toBe(context.solanaQuote)
  })

  // A limit order never quotes (planCreateLimitOrderStep derives its own buyTokenAccount straight from
  // context.receiver — see its params), so the buy-ATA the transaction actually creates has to target the
  // same receiver, or the order's signed intent points at an ATA that was never created and settlement
  // fails with something like `InvalidAccountData`. The quote's own receiver is stale/irrelevant here.
  it('creates the buy account for the resolved receiver, not the stale quote receiver, for a limit order', async () => {
    const context = buildContext({ orderClass: OrderClass.LIMIT })

    await solanaFlow(context, buildAnalytics())

    const [{ payer, receiver, quote }] = mockPlanCreateBuyAtaStep.mock.calls[0]
    expect(receiver.toBase58()).toBe(context.context.receiver)
    expect(receiver.toBase58()).not.toBe(RECEIVER_ADDRESS)
    expect(payer.toBase58()).toBe(SOLANA_ACCOUNT)
    expect(quote).toBe(context.solanaQuote)
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
          // Amounts come from the planner's actually-signed intent, not the quote directly: the quote's
          // are pre-slippage, so using them would show a limit price the on-chain order does not have.
          sellAmount: MARKET_SIGNED_SELL_AMOUNT.toString(),
          buyAmount: MARKET_SIGNED_BUY_AMOUNT.toString(),
          sellAmountBeforeFee: MARKET_SIGNED_SELL_AMOUNT.toString(),
        }),
      }),
      context.callbacks.dispatch,
    )
    expect(context.tradeConfirmActions.onSuccess).toHaveBeenCalledWith(ORDER_ID)
    expect(context.tradeConfirmActions.onError).not.toHaveBeenCalled()
    expect(analytics.trade).toHaveBeenCalledWith(context.tradeFlowAnalyticsContext)
    expect(analytics.sign).toHaveBeenCalledWith(context.tradeFlowAnalyticsContext)
  })

  // The quote's own OrderParameters.appData is a meaningless stub for Solana (ZERO_APP_DATA in
  // getSolanaQuote.ts) — the local order has to carry what the planner actually signed instead, the same
  // way it already overrides sellAmount/buyAmount/receiver/validTo from the signed intent, not the quote.
  // This is load-bearing: getUiOrderType reads this exact field to recognize a Solana limit order at all.
  it("records the market planner's actually-signed appData on the local order, not the quote's stub", async () => {
    const context = buildContext({ orderClass: OrderClass.MARKET })

    await solanaFlow(context, buildAnalytics())

    expect(addPendingOrderStepModule.addPendingOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({ order: expect.objectContaining({ appData: MARKET_APP_DATA_HEX }) }),
      expect.anything(),
    )
  })

  it("records the limit planner's actually-signed appData on the local order, not the quote's stub", async () => {
    const context = buildContext({ orderClass: OrderClass.LIMIT })

    await solanaFlow(context, buildAnalytics())

    expect(addPendingOrderStepModule.addPendingOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({ order: expect.objectContaining({ appData: LIMIT_APP_DATA_HEX }) }),
      expect.anything(),
    )
  })

  // Regression test: the local order previously always read sellAmount/buyAmount from
  // `solanaQuote.intent` (the market quote's own amounts) regardless of order class, so a limit order's
  // Redux/localStorage entry showed the market-implied price instead of the price the user entered and
  // actually signed on-chain — even though the on-chain order itself was correct.
  it("records the limit planner's actually-signed sellAmount/buyAmount on the local order, not the market quote's", async () => {
    const context = buildContext({ orderClass: OrderClass.LIMIT })

    await solanaFlow(context, buildAnalytics())

    expect(addPendingOrderStepModule.addPendingOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({
          sellAmount: LIMIT_SIGNED_SELL_AMOUNT.toString(),
          buyAmount: LIMIT_SIGNED_BUY_AMOUNT.toString(),
          sellAmountBeforeFee: LIMIT_SIGNED_SELL_AMOUNT.toString(),
        }),
      }),
      expect.anything(),
    )
  })

  it('sets the local order class from context.orderClass (LIMIT)', async () => {
    const context = buildContext({ orderClass: OrderClass.LIMIT })

    await solanaFlow(context, buildAnalytics())

    expect(addPendingOrderStepModule.addPendingOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({ class: OrderClass.LIMIT }),
      }),
      expect.anything(),
    )
  })

  it('sets the local order class from context.orderClass (MARKET)', async () => {
    const context = buildContext({ orderClass: OrderClass.MARKET })

    await solanaFlow(context, buildAnalytics())

    expect(addPendingOrderStepModule.addPendingOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({ class: OrderClass.MARKET }),
      }),
      expect.anything(),
    )
  })

  // A limit order never quotes for its price: planCreateLimitOrderStep takes only the raw intent fields,
  // so its amounts can never silently become whatever the market happened to be at quote time.
  it('dispatches a limit order to planCreateLimitOrderStep with the raw intent fields, not the quote planner', async () => {
    const context = buildContext({ orderClass: OrderClass.LIMIT })

    await solanaFlow(context, buildAnalytics())

    expect(mockPlanCreateLimitOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerAddress: context.account,
        receiverAddress: context.context.receiver,
        sellTokenAddress: context.context.inputAmount.currency.address,
        buyTokenAddress: context.context.outputAmount.currency.address,
        sellAmount: BigInt(context.context.inputAmount.quotient.toString()),
        buyAmount: BigInt(context.context.outputAmount.quotient.toString()),
        kind: context.context.orderKind,
        validTo: context.context.validTo,
        partiallyFillable: context.context.partiallyFillable,
      }),
    )
    expect(mockPlanCreateOrderStep).not.toHaveBeenCalled()
  })

  it('dispatches a market order to planCreateOrderStep (the quote-priced planner), not the limit one', async () => {
    const context = buildContext({ orderClass: OrderClass.MARKET })

    await solanaFlow(context, buildAnalytics())

    expect(mockPlanCreateOrderStep).toHaveBeenCalledWith(
      expect.objectContaining({ quoteResults: context.tradeQuote.quoteResults, solanaQuote: context.solanaQuote }),
    )
    expect(mockPlanCreateLimitOrderStep).not.toHaveBeenCalled()
  })

  it('emits the posted-order event so the rich "Order submitted" snackbar shows, not the raw tx summary', async () => {
    const context = buildContext()

    await solanaFlow(context, buildAnalytics())

    expect(mockEmitPostedOrderEvent).toHaveBeenCalledWith({
      chainId: SOLANA_CHAIN_ID,
      id: ORDER_ID,
      owner: context.account,
      kind: context.context.orderKind,
      uiOrderType: context.tradeFlowAnalyticsContext.orderType,
      receiver: context.context.receiver,
      inputAmount: context.context.inputAmount,
      outputAmount: context.context.outputAmount,
      orderCreationHash: TX_HASH,
    })
  })

  it('reports an error and adds nothing when sending rejects', async () => {
    mockSendSolanaFlow.mockRejectedValue(new Error('User rejected the request'))
    const context = buildContext()
    const analytics = buildAnalytics()

    const result = await solanaFlow(context, analytics)

    expect(result).toBeUndefined()
    expect(addPendingOrderStepModule.addPendingOrderStep).not.toHaveBeenCalled()
    expect(mockEmitPostedOrderEvent).not.toHaveBeenCalled()
    expect(context.tradeConfirmActions.onSuccess).not.toHaveBeenCalled()
    expect(context.tradeConfirmActions.onError).toHaveBeenCalled()
    expect(analytics.error).toHaveBeenCalled()
  })
})
