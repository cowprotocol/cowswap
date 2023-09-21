import { useAtomValue } from 'jotai'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { useTradeQuote } from 'modules/tradeQuote'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export enum LimitOrdersFormState {
  RateLoading = 'RateLoading',
  FeeExceedsFrom = 'FeeExceedsFrom',
  PriceIsNotSet = 'PriceIsNotSet',
  ZeroPrice = 'ZeroPrice',
}

interface LimitOrdersFormParams {
  activeRate: Fraction | null
  isRateLoading: boolean
  feeAmount: CurrencyAmount<Currency> | null
  sellAmount: CurrencyAmount<Currency> | null
  buyAmount: CurrencyAmount<Currency> | null
}

function getLimitOrdersFormState(params: LimitOrdersFormParams): LimitOrdersFormState | null {
  const { activeRate, isRateLoading, feeAmount, sellAmount, buyAmount } = params

  if (isFractionFalsy(activeRate)) {
    return LimitOrdersFormState.PriceIsNotSet
  }

  if (isRateLoading) {
    return LimitOrdersFormState.RateLoading
  }

  if (
    (!sellAmount?.equalTo(0) && buyAmount?.toExact() === '0') ||
    (!buyAmount?.equalTo(0) && buyAmount?.toExact() === '0')
  ) {
    return LimitOrdersFormState.ZeroPrice
  }

  if (sellAmount && feeAmount?.greaterThan(sellAmount)) {
    return LimitOrdersFormState.FeeExceedsFrom
  }

  return null
}

export function useLimitOrdersFormState(): LimitOrdersFormState | null {
  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()
  const quote = useTradeQuote()
  const { activeRate, isLoading } = useAtomValue(limitRateAtom)

  const feeRawAmount = quote?.response?.quote?.feeAmount
  const feeAmount =
    feeRawAmount && inputCurrencyAmount
      ? CurrencyAmount.fromRawAmount(inputCurrencyAmount.currency, feeRawAmount)
      : null

  const params: LimitOrdersFormParams = {
    activeRate,
    feeAmount,
    isRateLoading: isLoading,
    sellAmount: inputCurrencyAmount,
    buyAmount: outputCurrencyAmount,
  }

  return useSafeMemo(() => {
    return getLimitOrdersFormState(params)
  }, Object.values(params))
}
