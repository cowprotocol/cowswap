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
  approval?: AssistantApproval | null
}
