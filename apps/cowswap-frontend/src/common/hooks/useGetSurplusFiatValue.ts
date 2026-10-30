/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useEffect, useMemo, useState } from 'react'

import { MIN_FIAT_SURPLUS_VALUE, MIN_FIAT_SURPLUS_VALUE_MODAL, MIN_SURPLUS_UNITS } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { Order } from 'legacy/state/orders/actions'

import { useUsdAmount } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useGetExecutedBridgeSummary } from './useGetExecutedBridgeSummary'

export type SurplusData = {
  surplusFiatValue: Nullish<CurrencyAmount<Currency>>
  surplusAmount: Nullish<CurrencyAmount<Currency>>
  surplusToken: Nullish<Currency>
  surplusPercent: Nullish<string>
  /** Fiat label threshold ($0.01). Separate from the surplus-card threshold. */
  showFiatValue: boolean
  /**
   * Surplus card vs auction.
   * `true` shows the card, `false` shows the auction, `null` means the inputs are missing.
   * A zero `CurrencyAmount` is truthy, so an unfilled order comes back as `false`, not `null`.
   */
  showSurplus: boolean | null
  /**
   * Both executed amounts are on the order, and a positive surplus has a settled USD quote.
   * Stays true for that order after the first time, so a later price refresh cannot reopen the loading state.
   */
  isReady: boolean
}

/**
 * Surplus figures for one order.
 * The confirmation waits on `isReady` before choosing the surplus card or the auction.
 */
export function useGetSurplusData(order: Order | undefined): SurplusData {
  const summaryData = useGetExecutedBridgeSummary(order)

  const { surplusAmount, surplusToken, surplusPercent } = useMemo(() => {
    const output: { surplusToken?: Currency; surplusAmount?: CurrencyAmount<Currency>; surplusPercent?: string } = {}

    if (summaryData) {
      output.surplusAmount = summaryData.surplusAmount
      output.surplusToken = summaryData.surplusToken
      output.surplusPercent = summaryData.surplusPercent
    }

    return output
  }, [summaryData])

  const { value: surplusFiatValue, isLoading: surplusFiatLoading } = useUsdAmount(surplusAmount)
  const showFiatValue = Number(surplusFiatValue?.toExact()) >= MIN_FIAT_SURPLUS_VALUE
  const showSurplus = shouldShowSurplus(surplusFiatValue, surplusAmount)
  // An unfilled order still produces a zero surplus amount. That must not count as a finished "no".
  const positiveSurplus = Boolean(surplusAmount && !surplusAmount.equalTo(0))
  // The $1 card check needs fiat, so a positive surplus waits until that quote is done.
  const isReadyNow = hasSettledExecution(order) && (!positiveSurplus || !surplusFiatLoading)
  const isReady = useLatchedOrderReady(order?.id, isReadyNow)

  return useSafeMemo(
    () => ({
      surplusFiatValue,
      showFiatValue,
      surplusToken,
      surplusAmount,
      surplusPercent,
      showSurplus,
      isReady,
    }),
    [surplusFiatValue, showFiatValue, surplusToken, surplusAmount, surplusPercent, showSurplus, isReady],
  )
}

/** True once the fill is on the order. A real zero surplus still has positive executed amounts. */
function hasSettledExecution(order: Order | undefined): boolean {
  const info = order?.apiAdditionalInfo

  if (!info) {
    return false
  }

  // Same sell field `getOrderExecutedAmounts` uses. Before-fees is preferred when the API sends it.
  const sellAmount = info.executedSellAmountBeforeFees ?? info.executedSellAmount

  return isPositiveAtoms(info.executedBuyAmount) && isPositiveAtoms(sellAmount)
}

/** Atom strings are larger than `Number`. `"0"` and `"0.0"` are the unsettled sentinel. */
function isPositiveAtoms(amount: string | undefined): boolean {
  return Boolean(amount && /[1-9]/.test(amount))
}

function shouldShowSurplus(
  fiatAmount: Nullish<CurrencyAmount<Currency>>,
  surplusAmount: Nullish<CurrencyAmount<Currency>>,
): boolean | null {
  if (fiatAmount) {
    // Card threshold is $1. The $0.01 check only decides whether to print the fiat label.
    return Number(fiatAmount.toFixed(fiatAmount.currency.decimals)) > MIN_FIAT_SURPLUS_VALUE_MODAL
  } else if (surplusAmount) {
    return Number(surplusAmount.toFixed(surplusAmount.currency.decimals)) > MIN_SURPLUS_UNITS
  }

  return null
}

/**
 * Keeps the first ready result for an order id.
 * `useUsdAmount` sets `isLoading` again on a price refresh, which would otherwise flip `isReady` back to false.
 */
function useLatchedOrderReady(orderId: string | undefined, isReadyNow: boolean): boolean {
  const [readyOrderId, setReadyOrderId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (orderId && isReadyNow) {
      setReadyOrderId(orderId)
    }
  }, [orderId, isReadyNow])

  return Boolean(orderId && (readyOrderId === orderId || isReadyNow))
}
