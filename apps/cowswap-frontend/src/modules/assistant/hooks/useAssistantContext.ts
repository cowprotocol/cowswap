import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Price } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { executionPriceAtom, useRateImpact } from 'modules/limitOrders'
import {
  DEFAULT_TRADE_DERIVED_STATE,
  TradeType,
  useDerivedTradeState,
  useTradePriceImpact,
  useTradeTypeInfo,
} from 'modules/trade'

import {
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
const SMALL_LIMIT_USD: Record<number, number> = { 1: 100, 8453: 5 }

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

  const isLimit = tradeTypeInfo?.tradeType === TradeType.LIMIT_ORDER

  return useMemo(() => {
    // Resolve the null-state once rather than optional-chaining every field.
    const state = derived ?? DEFAULT_TRADE_DERIVED_STATE

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
      quoteStatus: deriveQuoteStatus(priceImpact),
      limitPrice: deriveLimitPrice(isLimit, rateImpact),
      limitOrderSize: deriveLimitOrderSize(isLimit, chainId, state.inputCurrencyFiatAmount),
      estimatedFillPrice: formatFillPrice(isLimit, executionPrice),
    }
  }, [derived, priceImpact, rateImpact, executionPrice, isLimit, account, chainId])
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
function deriveQuoteStatus(priceImpact: PriceImpact): AssistantQuoteStatus | null {
  if (priceImpact.loading || !priceImpact.priceImpact) return null

  const pct = Number(priceImpact.priceImpact.toSignificant(4))
  if (!Number.isFinite(pct)) return null

  if (pct < IMPACT_CALLOUT_PCT) return { status: 'ok', error_type: null }
  return { status: 'high_impact', approxImpactPct: Number(pct.toFixed(1)), error_type: null }
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
