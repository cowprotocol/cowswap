import { useCallback } from 'react'

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { parameterizeTradeRoute } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { AssistantProposal } from '../types'

const SUPPORTED_CHAINS: number[] = [SupportedChainId.MAINNET, SupportedChainId.BASE]

export type ApplyResult = { ok: true } | { ok: false; problem: string }

/**
 * Applies a proposal to the trade form.
 *
 * **One navigation, atomically.** Chain, both tokens, the order type (which is the
 * route), both amounts and the order kind all travel in a single URL, and
 * `useSetupTradeAmountsFromUrl` reads the amounts back into state — the app's own
 * documented behaviour: `/#/1/limit/WETH/COW?sellAmount=4&buyAmount=360000`.
 *
 * That is the single biggest improvement over the widget path, where the same
 * operation had to be split into a chain change and then a tab change, sequenced on
 * an event, after three failed attempts at doing it in one update. Here there is
 * nothing to sequence: the URL either describes the trade or it doesn't.
 *
 * ⚠️ **The URL is expressive enough for swap and limit, and no further.**
 *
 * - Limit price needs nothing extra: the app derives the rate from both amounts,
 *   which is its own documented behaviour and what SetupLimitOrderAmountsFromUrl
 *   exists to do. `limitRateAtom.activeRate` follows from them.
 * - **TWAP does not fit.** Number of parts, duration and price protection live in
 *   `twapOrdersSettingsAtom` and have no URL representation at all — the only
 *   URLSearchParams in modules/twap is for fetching orders from Safe's API.
 *
 * So when EOA TWAP arrives, this grows a second phase: navigate for route, tokens
 * and amounts as now, then write the advanced settings to their atom **once the
 * route has settled** — `useTradeState()` resolves by route, so writing immediately
 * after navigating targets the previous order type's module. That second phase is
 * the sequencing hazard this URL approach avoids everywhere else, which is why it's
 * worth confining to the one order type that actually needs it rather than adopting
 * it for all of them now.
 *
 * `propose_trade`'s schema has to grow fields for TWAP regardless, so that work is
 * not avoided by choosing a different mechanism today.
 */
export function useApplyProposal(): (proposal: AssistantProposal) => ApplyResult {
  const navigate = useNavigate()

  return useCallback(
    (proposal: AssistantProposal): ApplyResult => {
      const problem = validate(proposal)
      if (problem) {
        console.error('[assistant] rejected proposal:', problem, proposal)
        return { ok: false, problem }
      }

      // Which side is fixed. A market order names exactly one amount, and that side
      // is the one the user meant — "buy exactly 100 AAVE" is a BUY order.
      const orderKind = proposal.buyAmount && !proposal.sellAmount ? OrderKind.BUY : OrderKind.SELL

      navigate(
        parameterizeTradeRoute(
          {
            chainId: String(proposal.chainId),
            inputCurrencyId: proposal.sellToken,
            outputCurrencyId: proposal.buyToken,
            inputCurrencyAmount: proposal.sellAmount,
            outputCurrencyAmount: proposal.buyAmount,
            orderKind,
            targetChainId: undefined,
          },
          proposal.orderType === 'limit' ? Routes.LIMIT_ORDERS : Routes.SWAP,
          true,
        ),
      )

      return { ok: true }
    },
    [navigate],
  )
}

function isTokenId(id: string): boolean {
  return id === 'ETH' || /^0x[a-fA-F0-9]{40}$/.test(id || '')
}

/**
 * Guard clauses on anything the model proposes.
 *
 * The tool schema already constrains this — `strict: true` makes it an API-enforced
 * contract rather than a suggestion — but the schema is the model's side of the
 * boundary and this is ours. `recipient` is absent from both. Spec §4, §7.
 */
function validate(proposal: AssistantProposal): string | null {
  if (!proposal) return 'Empty proposal.'
  return validateTokens(proposal) ?? validateAmounts(proposal)
}

/**
 * Amount rules differ by order type. A market order fixes exactly one side; a limit
 * order needs both, because together they ARE the price — a missing side means a
 * price the user never chose.
 */
function validateAmounts(proposal: AssistantProposal): string | null {
  if (proposal.orderType === 'swap' && proposal.sellAmount && proposal.buyAmount) {
    return 'A market order must set only one amount.'
  }
  if (proposal.orderType === 'limit' && (!proposal.sellAmount || !proposal.buyAmount)) {
    return 'A limit order needs both amounts — they are what set the price.'
  }
  return null
}

/** Tokens must be real, distinct, and on a chain we support. */
function validateTokens(proposal: AssistantProposal): string | null {
  if (!SUPPORTED_CHAINS.includes(proposal.chainId)) return `Unsupported chain: ${proposal.chainId}`
  if (!isTokenId(proposal.sellToken) || !isTokenId(proposal.buyToken)) {
    return 'Token is not an address or "ETH".'
  }
  if (proposal.sellToken.toLowerCase() === proposal.buyToken.toLowerCase()) {
    return 'Sell and buy tokens are the same.'
  }
  return null
}
