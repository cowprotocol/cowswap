import { useCallback } from 'react'

import { NATIVE_CURRENCY_ADDRESS, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAINS_MAP, OrderKind } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useUpdateSwapRawState } from 'modules/swap'
import { parameterizeTradeRoute, useTradeConfirmActions } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'

import { AssistantProposal } from '../types'

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
export function useApplyProposal(): (proposal: AssistantProposal) => Promise<ApplyResult> {
  const navigate = useNavigate()
  const { onDismiss } = useTradeConfirmActions()
  const onSelectNetwork = useOnSelectNetwork()
  const updateSwapState = useUpdateSwapRawState()
  const { chainId: walletChainId } = useWalletInfo()

  return useCallback(
    async (proposal: AssistantProposal): Promise<ApplyResult> => {
      const problem = validate(proposal)
      if (problem) {
        console.error('[assistant] rejected proposal:', problem, proposal)
        return { ok: false, problem }
      }

      // Which side is fixed. A market order names exactly one amount, and that side
      // is the one the user meant — "buy exactly 100 AAVE" is a BUY order.
      const orderKind = proposal.buyAmount && !proposal.sellAmount ? OrderKind.BUY : OrderKind.SELL

      const url = parameterizeTradeRoute(
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
      )

      // Split rather than passing the joined string: this is the shape
      // useTradeNavigate uses, and the app's own navigation is the thing to copy
      // when a route has to be understood by the trade updaters at the other end.
      const [pathname, search = ''] = url.split('?')

      // ⚠️ **Switch the wallet's network BEFORE navigating, never after.**
      //
      // A trade URL naming a chain the wallet isn't on is a mismatch, and
      // useSetupTradeState resolves mismatches by resetting to that chain's default
      // state — which threw the tokens away and left "Select a token" in a form the
      // card had just claimed to fill. Worse, the reconciliation that would have
      // asked the wallet to switch keys off a *change* in the URL chain, and a
      // proposal that also changes order type swaps route modules, so the effect
      // sees a fresh mount with no previous URL state to compare against and asks
      // for nothing.
      //
      // onSelectNetwork is the app's own entry point — the network selector uses it —
      // and it sets the chain in the URL once the wallet agrees. Doing that first
      // means our navigate lands on a URL the app already considers consistent.
      if (proposal.chainId !== walletChainId) {
        console.info('[assistant] switching network', walletChainId, '→', proposal.chainId)
        // skipClose: we aren't in the network selector, so there's no modal to close.
        await onSelectNetwork(proposal.chainId, true)
      }

      console.info('[assistant] applying proposal →', pathname, search)
      navigate({ pathname, search })

      // Lift the cross-chain unlock screen if it's still covering the form.
      //
      // `isUnlocked` lives in local storage and starts false, so a new device — or
      // cleared storage — meets a full-width promo over the trade form. The trade
      // loaded correctly behind it and could not be seen or quoted, which is the
      // same failure as the success screen: a card claiming success over a form
      // nobody can look at.
      //
      // Idempotent, and only ever in the direction the person is already heading:
      // they asked for a trade, and this is what the screen's own button does.
      updateSwapState({ isUnlocked: true })

      // Close the trade confirmation if it's still up. After a swap settles, the
      // widget stays on "Transaction completed!", which covers the form — so the
      // card said "Loaded into the form" while the form was behind a success screen
      // the person had no reason to connect to their next trade. Loading a trade and
      // then hiding it is worse than not loading it, because it looks like it worked.
      //
      // Safe when nothing is open: onDismiss only clears state that a closed
      // confirmation isn't holding.
      onDismiss()

      return { ok: true }
    },
    [navigate, onDismiss, onSelectNetwork, updateSwapState, walletChainId],
  )
}

/** The chain's native currency, by symbol or by the sentinel address the API uses for it. */
function isNativeToken(id: string, chainId: number): boolean {
  const chain = ALL_SUPPORTED_CHAINS_MAP[chainId as keyof typeof ALL_SUPPORTED_CHAINS_MAP]
  return id === chain?.nativeCurrency.symbol || id.toLowerCase() === NATIVE_CURRENCY_ADDRESS.toLowerCase()
}

/**
 * A token id is a contract address, or the chain's native currency symbol.
 *
 * ⚠️ Native is NOT "ETH" everywhere — xDAI on Gnosis, POL on Polygon, plus AVAX,
 * BNB and XPL. Reading the symbol from the SDK rather than hardcoding it means this
 * can't drift from the chains the app actually supports.
 */
function isTokenId(id: string, chainId: number): boolean {
  const chain = ALL_SUPPORTED_CHAINS_MAP[chainId as keyof typeof ALL_SUPPORTED_CHAINS_MAP]
  return id === chain?.nativeCurrency.symbol || /^0x[a-fA-F0-9]{40}$/.test(id || '')
}

/** Native → wrapped native on the same chain, which the app treats as a wrap rather than a trade. */
function isWrap(proposal: AssistantProposal): boolean {
  const wrapped = WRAPPED_NATIVE_CURRENCIES[proposal.chainId as keyof typeof WRAPPED_NATIVE_CURRENCIES]
  return Boolean(wrapped && proposal.buyToken.toLowerCase() === wrapped.address.toLowerCase())
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
  return validateTokens(proposal) ?? validateAmounts(proposal) ?? validateNativeSell(proposal)
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

/**
 * ⚠️ **A market order selling native currency can only be a sell order.**
 *
 * Selling native goes through the EthFlow path, which fixes the sell side: you name
 * how much native to spend and the market decides what you get. So the form makes
 * the buy field read-only whenever the sell token is native — `TradeWidgetForm`, on
 * `isSellingEthSupported && isEoaEthFlow`.
 *
 * **Rejected here rather than left to the form, because the form does not merely
 * ignore the buy amount.** `SwapWidget` applies `SELL_ETH_RESET_STATE` —
 * `{ orderKind: SELL, inputCurrencyAmount: null, outputCurrencyAmount: null }` — so
 * both amounts are cleared and the kind flips back. "Buy 500 COW with ETH" would
 * leave two tokens, no numbers, and a card asserting a trade that no longer exists.
 * That is the same failure as a card claiming success over a form nobody can act on,
 * and it is silent: nothing in the state block says the form emptied itself.
 *
 * A refusal handed back to the model is recoverable. An emptied form is not. The
 * prompt already declines this and offers the wrap route; this is our side of that
 * boundary. Spec §25.
 *
 * **A wrap is exempt, and must be.** Native → wrapped native sets `isWrapOrUnwrap`,
 * which makes `isEoaEthFlowAtom` false, so neither the read-only field nor the reset
 * applies — "wrap enough to get 0.5 WETH" is a legal buy order and rejecting it
 * would break the first half of every wrap-then-limit sequence.
 *
 * Limit orders are deliberately not covered: they cannot sell native at all, and the
 * form says so on its own button ("Selling ETH is not supported"). A refusal the
 * person can already read needs no guard here.
 */
function validateNativeSell(proposal: AssistantProposal): string | null {
  if (proposal.orderType !== 'swap' || !proposal.buyAmount) return null
  if (!isNativeToken(proposal.sellToken, proposal.chainId) || isWrap(proposal)) return null

  const chain = ALL_SUPPORTED_CHAINS_MAP[proposal.chainId as keyof typeof ALL_SUPPORTED_CHAINS_MAP]
  const symbol = chain?.nativeCurrency.symbol ?? 'native currency'

  return `A market order selling ${symbol} must set the sell amount, not the buy amount. Propose the wrap first, then the buy order selling wrapped ${symbol}.`
}

/** Tokens must be real, distinct, and on a chain we support. */
function validateTokens(proposal: AssistantProposal): string | null {
  const chain = ALL_SUPPORTED_CHAINS_MAP[proposal.chainId as keyof typeof ALL_SUPPORTED_CHAINS_MAP]
  if (!chain) return `Unsupported chain: ${proposal.chainId}`

  if (!isTokenId(proposal.sellToken, proposal.chainId) || !isTokenId(proposal.buyToken, proposal.chainId)) {
    return `Token is not an address or ${chain.nativeCurrency.symbol}.`
  }
  if (proposal.sellToken.toLowerCase() === proposal.buyToken.toLowerCase()) {
    return 'Sell and buy tokens are the same.'
  }
  return null
}
