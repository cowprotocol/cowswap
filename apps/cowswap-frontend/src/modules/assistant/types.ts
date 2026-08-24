import { SupportedChainId } from '@cowprotocol/cow-sdk'

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
}
