import { SupportedChainId } from '@cowprotocol/cow-sdk'

/** One token the app can see the user holding, on the connected chain. */
/**
 * The extra step, if any, before this trade can go through.
 *
 * Absent when there's nothing to mention. A permit is a free signature; an approval
 * is a gas-costing transaction — conflating them is how you tell someone to spend
 * money they don't need to spend.
 */
export interface AssistantApproval {
  /** USDT-style: the allowance must be set to zero first, so it's two transactions. */
  needsZeroFirst?: boolean
  permitType?: 'dai-like' | 'eip-2612'
  status: 'approval_transaction' | 'bundled_with_trade' | 'permit_signature'
}

/**
 * A settlement the app observed. Amounts are what actually executed.
 *
 * Either amount may be null when the token isn't resolvable — the symbol without a
 * number is still worth sending, and a number with the wrong decimals is not.
 */
export interface AssistantFill {
  chainId: number
  sellAmount: string | null
  sellSymbol: string | null
  buyAmount: string | null
  buySymbol: string | null
}

/**
 * Why the form's own button is disabled, in terms a person would recognise.
 *
 * Absent when nothing is blocking. `other` is deliberate and load-bearing: it says
 * "something blocks this and it isn't one of these", which is the difference between
 * an honest "the form is blocking it — have a look" and a confident wrong guess.
 */
export type AssistantFormBlocker =
  | 'incomplete'
  | 'insufficient_balance'
  | 'loading'
  | 'network_unsupported'
  | 'offline'
  | 'other'
  | 'price_impact'
  | 'quote_error'
  | 'restricted'
  | 'sell_native_needs_wrap'
  | 'token_unsupported'
  | 'wallet_not_connected'

export interface AssistantHolding {
  address: string
  balance: string
  symbol: string
}

export interface AssistantLimitOrderSize {
  status: 'small_for_chain'
  chainId: number
}

export interface AssistantLimitPrice {
  status: 'above_market' | 'at_market' | 'below_market'
  approxDeviationPct: number
}

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: unknown
}

/**
 * One open limit order, as the app already understands it.
 *
 * ⚠️ Every "why isn't it filling" field is three-valued, not two. `undefined` on the
 * app's fillability checks means *not computed yet*, and reporting that as "you don't
 * have enough" would tell someone their order is stuck when nobody has looked. So
 * blockers are listed only when the answer is a definite no, and `fillabilityUnknown`
 * carries the third case explicitly.
 */
export interface AssistantOpenOrder {
  /** Short id, enough to match against the orders table. */
  ref: string
  selling: string | null
  buying: string | null
  /** ISO date. Absent when the order effectively never expires. */
  expires?: string
  /** The app's own judgement — price has moved away since placement. */
  outOfMarket?: true
  /** Definite blockers only: 'balance' and/or 'allowance'. */
  cannotFillBecause?: string[]
  /** The checks haven't run yet, so silence about blockers means nothing. */
  fillabilityUnknown?: true
  /** Being cancelled right now. */
  cancelling?: true
  /** From the app's pending-order prices. Absent when the quote API errored. */
  estimatedFillPrice?: string
}

/**
 * An order the person just signed and posted.
 *
 * Placement and settlement are different moments. For a market order they are
 * seconds apart, so `lastFill` is the better of the two to speak on — it carries
 * what actually arrived. For a limit order, placement may be the last thing that
 * happens for days, which is why it's worth acknowledging at all.
 */
export interface AssistantPlacement {
  /** 'LIMIT' | 'TWAP' | … — never 'SWAP'; see usePlacementWatch. */
  orderType: string
  selling: string | null
  buying: string | null
}

/** What `propose_trade` returns. No recipient field — deliberately (spec §7). */
export interface AssistantProposal {
  chainId: number
  orderType: 'swap' | 'limit'
  sellToken: string
  buyToken: string
  sellAmount?: string
  buyAmount?: string
  summary: string
}

export interface AssistantQuoteStatus {
  status: 'ok' | 'high_impact'
  approxImpactPct?: number
  error_type: string | null
  /**
   * High impact on a trade too small for its own size to be the cause — the pair is
   * thin. Present only when both are true, because it changes the advice completely:
   * "trade a smaller amount" is useless when the amount is already tiny.
   */
  thinLiquidity?: true
}

/**
 * The state block sent to the assistant backend each turn.
 *
 * ⚠️ These field names are a contract with `api/conversation.js` (renderUiContext)
 * in the nlp-demo repo. Renaming one here silently drops it from the model's view
 * rather than failing — the backend only prints the fields it recognises.
 */
export interface AssistantTokenRef {
  symbol?: string
  address?: string
}

export interface AssistantTurn {
  reply: string
  proposal: AssistantProposal | null
  display: { sellSymbol: string; buySymbol: string } | null
  preamble: string | null
  messages: AssistantMessage[]
  meta: Record<string, unknown>
}

export interface AssistantUiContext {
  /**
   * How this turn arrived. 'voice' makes the prompt's rule about repeating dictated
   * numbers back reachable — without it the model cannot tell a spoken ticker from a
   * typed one, and the rule can never fire. 'app' marks a turn the app injected.
   */
  inputMode?: 'app' | 'typed' | 'voice'
  orderType: 'swap' | 'limit'
  chainId: SupportedChainId
  walletAddress?: string
  isConnected: boolean
  sellToken?: AssistantTokenRef | null
  buyToken?: AssistantTokenRef | null
  sellTokenAmount?: string | null
  buyTokenAmount?: string | null
  sellTokenBalance?: string | null
  buyTokenBalance?: string | null
  slippageBps?: number | null
  quoteStatus?: AssistantQuoteStatus | null
  limitPrice?: AssistantLimitPrice | null
  limitOrderSize?: AssistantLimitOrderSize | null
  /** In-app only: the widget path can't see this at all (spec §13). */
  estimatedFillPrice?: string | null
  /**
   * Non-zero balances across every token the app tracks — NOT the whole wallet.
   * See deriveHoldings, and the disclosure the prompt requires when listing them.
   */
  holdings?: AssistantHolding[]
  holdingsTruncated?: boolean
  /**
   * Present when `holdings` could not be read, so an empty list never has to stand
   * in for an unknown one. Switching chains is the ordinary case: balances refetch,
   * and until they arrive the wallet looks empty on the new chain.
   */
  holdingsUnavailable?: 'error' | 'loading'
  /** Sent only on the turn that reports a settlement. */
  lastFill?: AssistantFill
  /** Sent only on the turn that reports a placement. */
  lastPlacement?: AssistantPlacement
  /**
   * Open limit orders on this chain, from the app's own pending-order state rather
   * than the Orderbook API — see useOpenLimitOrders for why that distinction matters.
   */
  openOrders?: AssistantOpenOrder[]
  openOrdersTruncated?: true

  /** Why the form's button is disabled, when it is. */
  formBlocker?: AssistantFormBlocker
  /**
   * Present only while the swap form is behind the cross-chain unlock screen — a
   * promo a new device meets before it can trade. Absent in the ordinary case.
   */
  formCovered?: true
  approval?: AssistantApproval | null
}
