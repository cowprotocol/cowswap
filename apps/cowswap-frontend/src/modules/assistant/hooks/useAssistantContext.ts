import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Price } from '@cowprotocol/currency'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { executionPriceAtom, useRateImpact } from 'modules/limitOrders'
import {
  DEFAULT_TRADE_DERIVED_STATE,
  TradeType,
  useDerivedTradeState,
  useTradePriceImpact,
  useTradeTypeInfo,
} from 'modules/trade'

import { useApprovalContext } from './useApprovalContext'
import { useFormBlocker } from './useFormBlocker'

import {
  AssistantHolding,
  AssistantLimitOrderSize,
  AssistantLimitPrice,
  AssistantQuoteStatus,
  AssistantTokenRef,
  AssistantUiContext,
} from '../types'

/**
 * Speak up about price impact at the same point the app itself does. Change this
 * together with whatever threshold the form warns at, or the assistant will
 * reassure someone the form is warning.
 */
const IMPACT_CALLOUT_PCT = 5

/**
 * Below this order value a limit order is unlikely to fill on that chain, because
 * settlement costs are roughly fixed per order and dwarf a small one. Ethereum
 * settlement costs orders of magnitude more than Base, hence per-chain figures.
 *
 * ⚠️ Judgement calls, not computed figures.
 */
const SMALL_LIMIT_USD: Record<number, number> = {
  [SupportedChainId.MAINNET]: 100,
  [SupportedChainId.GNOSIS_CHAIN]: 2,
  // Every other supported chain settles cheaply enough that $5 is the sane floor;
  // Sepolia is deliberately absent, since warning about play money is noise.
  [SupportedChainId.BASE]: 5,
  [SupportedChainId.ARBITRUM_ONE]: 5,
  [SupportedChainId.POLYGON]: 5,
  [SupportedChainId.AVALANCHE]: 5,
  [SupportedChainId.BNB]: 5,
  [SupportedChainId.LINEA]: 5,
  [SupportedChainId.INK]: 5,
  [SupportedChainId.PLASMA]: 5,
}

/**
 * Below this, a trade's own size cannot reasonably explain a large price impact —
 * the pair is thin. A flat figure across chains on purpose: this is about the depth
 * of one pool, which has nothing to do with what a chain costs to settle on.
 *
 * A judgement, deliberately, not a number we send. Same reason as SMALL_LIMIT_USD:
 * the model gets the conclusion and cannot quote a threshold it would then have to
 * defend.
 */
const THIN_LIQUIDITY_MAX_USD = 250

/**
 * How many holdings to send. Every turn resends this, so it can't be unbounded —
 * and a wallet with hundreds of dust positions would drown the useful ones.
 * Truncation is reported rather than hidden.
 */
const MAX_HOLDINGS = 40

interface HoldingsAvailability {
  balances: Record<string, bigint | undefined>
  balancesChainId: number | null
  chainId: SupportedChainId
  hasFirstLoad: boolean
  balancesError: string | null
}

/**
 * Builds the state block the assistant reads each turn.
 *
 * The in-app replacement for the widget's ON_CHANGE_TRADE_PARAMS event, and better
 * in three specific ways: balances are a real read rather than whatever the form
 * happened to render, price impact is the app's own number instead of a fiat-delta
 * proxy, and the limit-price deviation and estimated fill price exist at all.
 * Spec §6, §13.
 *
 * Every derived signal is ABSENT when there's nothing worth saying. Silence by
 * default is deliberate: an assistant that volunteers figures about healthy trades
 * is how the widget build produced three separate misreads.
 */
export function useAssistantContext(): AssistantUiContext {
  const { account, chainId } = useWalletInfo()
  const derived = useDerivedTradeState()
  const priceImpact = useTradePriceImpact()
  const rateImpact = useRateImpact()
  const executionPrice = useAtomValue(executionPriceAtom)
  const tradeTypeInfo = useTradeTypeInfo()
  const { values: balances, chainId: balancesChainId, hasFirstLoad, error: balancesError } = useTokensBalancesCombined()
  const tokensByAddress = useTokensByAddressMap()
  const approval = useApprovalContext()
  const formBlocker = useFormBlocker()

  const isLimit = tradeTypeInfo?.tradeType === TradeType.LIMIT_ORDER

  return useMemo(() => {
    // Resolve the null-state once rather than optional-chaining every field.
    const state = derived ?? DEFAULT_TRADE_DERIVED_STATE

    const unavailable = holdingsAvailability({ balances, balancesChainId, chainId, hasFirstLoad, balancesError })
    const { holdings, truncated } = deriveHoldings(balances, tokensByAddress)

    return {
      orderType: isLimit ? 'limit' : 'swap',
      chainId,
      // Pinned server-side for get_orders; the model never supplies an address.
      walletAddress: account,
      isConnected: Boolean(account),
      sellToken: toTokenRef(state.inputCurrency),
      buyToken: toTokenRef(state.outputCurrency),
      sellTokenAmount: exact(state.inputCurrencyAmount),
      buyTokenAmount: exact(state.outputCurrencyAmount),
      // Real balances for the selected tokens — a genuine read, unlike the widget
      // path. Still one chain only; see spec §20.7 for why.
      sellTokenBalance: exact(state.inputCurrencyBalance),
      buyTokenBalance: exact(state.outputCurrencyBalance),
      slippageBps: toBps(state.slippage),
      quoteStatus: deriveQuoteStatus(priceImpact, state.inputCurrencyFiatAmount),
      limitPrice: deriveLimitPrice(isLimit, rateImpact),
      limitOrderSize: deriveLimitOrderSize(isLimit, chainId, state.inputCurrencyFiatAmount),
      estimatedFillPrice: formatFillPrice(isLimit, executionPrice),
      approval,
      // Absent when nothing is blocking, so silence stays the default.
      ...(formBlocker ? { formBlocker } : {}),
      // Absent while unknown, so the model has nothing to mistake for an answer.
      ...(unavailable ? { holdingsUnavailable: unavailable } : { holdings }),
      ...(!unavailable && truncated ? { holdingsTruncated: true } : {}),
    }
  }, [
    derived,
    priceImpact,
    rateImpact,
    executionPrice,
    isLimit,
    account,
    chainId,
    balances,
    balancesChainId,
    hasFirstLoad,
    balancesError,
    tokensByAddress,
    approval,
    formBlocker,
  ])
}

/**
 * Everything the app can see the user holding, on the connected chain.
 *
 * ⚠️ **This is not the wallet.** Balances are multicalled for `useAllActiveTokens()`
 * — the enabled token lists plus anything the user imported — so a token in no list
 * and never imported is invisible here, however much of it they hold. The prompt
 * requires that limit to be stated whenever holdings are listed, because "I can't
 * see it" and "you don't have it" must never look the same.
 *
 * Zero balances are dropped: they're the overwhelming majority of the map and carry
 * no information.
 */
function deriveHoldings(
  balances: Record<string, bigint | undefined>,
  tokensByAddress: Record<string, TokenWithLogo | undefined>,
): { holdings: AssistantHolding[]; truncated: boolean } {
  const held: AssistantHolding[] = []

  for (const token of Object.values(tokensByAddress)) {
    // Both maps are keyed by getAddressKey, so this lookup is exact rather than
    // a case-sensitivity gamble.
    const raw = token && balances[getAddressKey(token.address)]
    if (!token || !raw) continue

    held.push({
      symbol: token.symbol ?? '?',
      address: token.address,
      balance: CurrencyAmount.fromRawAmount(token, raw.toString()).toExact(),
    })
  }

  held.sort((a, b) => a.symbol.localeCompare(b.symbol))

  return { holdings: held.slice(0, MAX_HOLDINGS), truncated: held.length > MAX_HOLDINGS }
}

/** Flags a limit order too small to be worth settling on its chain. */
function deriveLimitOrderSize(
  isLimit: boolean,
  chainId: SupportedChainId,
  fiatAmount: CurrencyAmount<Currency> | null | undefined,
): AssistantLimitOrderSize | null {
  if (!isLimit || !fiatAmount) return null

  const usd = Number(fiatAmount.toExact())
  const threshold = SMALL_LIMIT_USD[chainId]
  if (!threshold || !Number.isFinite(usd) || usd <= 0 || usd >= threshold) return null

  return { status: 'small_for_chain', chainId }
}

/**
 * How far the limit price sits from market.
 *
 * `useRateImpact` returns `(activeRate / marketRate) * 100 - 100`, so positive means
 * asking above market. It returns 0 — not null — while loading or when either rate
 * is missing, so 0 must be read as "no signal" rather than "exactly at market".
 */
function deriveLimitPrice(isLimit: boolean, rateImpact: number): AssistantLimitPrice | null {
  if (!isLimit || rateImpact === 0) return null

  const status = rateImpact < -1 ? 'below_market' : rateImpact > 1 ? 'above_market' : 'at_market'
  return { status, approxDeviationPct: Number(rateImpact.toFixed(1)) }
}

/**
 * Positive price impact means LOSING value: the app's own indicator colours
 * positive as danger and negates it for display.
 *
 * Absent while loading, which is deliberate — "unknown" and "fine" must not look
 * the same to the model, and a healthy quote deserves no figure at all.
 */
function deriveQuoteStatus(
  priceImpact: PriceImpact,
  fiatAmount: CurrencyAmount<Currency> | null | undefined,
): AssistantQuoteStatus | null {
  if (priceImpact.loading || !priceImpact.priceImpact) return null

  const pct = Number(priceImpact.priceImpact.toSignificant(4))
  if (!Number.isFinite(pct)) return null

  if (pct < IMPACT_CALLOUT_PCT) return { status: 'ok', error_type: null }

  // Is the trade big enough for its size to be the explanation? A 33% impact on
  // $25 of WETH is not a trade that's too large; it's a pair with nothing in it.
  const usd = fiatAmount ? Number(fiatAmount.toExact()) : NaN
  const thin = Number.isFinite(usd) && usd > 0 && usd < THIN_LIQUIDITY_MAX_USD

  return {
    status: 'high_impact',
    approxImpactPct: Number(pct.toFixed(1)),
    error_type: null,
    ...(thin ? { thinLiquidity: true as const } : {}),
  }
}

/** Every `x?.toExact() ?? null` is two branches; naming it once keeps the assembly flat. */
function exact(amount: CurrencyAmount<Currency> | null | undefined): string | null {
  return amount?.toExact() ?? null
}

/**
 * The number the widget path could never see (spec §13).
 *
 * Formatted rather than raw so the model quotes it instead of computing with it.
 */
function formatFillPrice(isLimit: boolean, price: Price<Currency, Currency> | null): string | null {
  if (!isLimit || !price) return null
  return `${price.toSignificant(6)} ${price.quoteCurrency.symbol} per ${price.baseCurrency.symbol}`
}

/**
 * Whether the balances can be reported at all, and if not, why.
 *
 * ⚠️ An empty holdings list must never stand in for an unread one — and an unread
 * one must not be claimed either. Two different mistakes, and `hasFirstLoad` alone
 * gets both wrong.
 *
 * **Too strict.** BalancesCacheUpdater restores balances from a persisted cache and
 * deliberately leaves the flag alone, so after a page load there are real, usable
 * balances on screen while it's still false. Gating on it produced "I can't see your
 * Base balances yet" to someone looking at them. Having values is enough to answer
 * with; the flag only says whether a multicall has finished.
 *
 * **Too lax**, which is the more dangerous half. Nothing resets it on a chain change
 * and nothing clears `values` — the updater MERGES new balances over old — so after
 * switching chains it stays true while the map still describes the previous chain.
 * Intersected with the new chain's token map that yields almost nothing, which is how
 * "you hold none of the tracked tokens on Ethereum" reached someone who holds plenty.
 *
 * The question that actually matters is which chain the numbers belong to, and
 * `chainId` on the balances state answers it directly.
 */
function holdingsAvailability({
  balances,
  balancesChainId,
  chainId,
  hasFirstLoad,
  balancesError,
}: HoldingsAvailability): 'error' | 'loading' | null {
  if (balancesError) return 'error'
  // Numbers for a different chain are not numbers for this one.
  if (balancesChainId !== null && balancesChainId !== chainId) return 'loading'
  if (!hasFirstLoad && Object.keys(balances).length === 0) return 'loading'
  return null
}

function toBps(slippage: Percent | null | undefined): number | null {
  if (!slippage) return null
  const pct = Number(slippage.toSignificant(6))
  return Number.isFinite(pct) ? Math.round(pct * 100) : null
}

/** Native currency has no address; the backend and the widget both take "ETH". */
function toTokenRef(currency: Currency | null | undefined): AssistantTokenRef | null {
  if (!currency) return null
  return { symbol: currency.symbol, address: currency.isToken ? currency.address : 'ETH' }
}
