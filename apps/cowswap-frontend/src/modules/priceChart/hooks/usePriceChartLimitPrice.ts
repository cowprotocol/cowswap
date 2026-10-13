import { useCallback, useMemo } from 'react'

import { skipToken, useQuery } from '@tanstack/react-query'

import { getCurrencyAddress, getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import type { Currency, Fraction, Price } from '@cowprotocol/currency'

import { useUsdPrice } from 'modules/usdAmount'

import { loadMarketCapSupply } from '../lib/loadPriceChartHistory'
import { getActivePriceLimitLinePrice, getSelectedPriceLimitRate } from '../lib/priceChartLimitPrice.utils'

import type { ChartMetric, PriceChartReferenceLine, SupplyVariant } from '../lib/priceChart.types'

const EMPTY_REFERENCE_LINES: PriceChartReferenceLine<Price<Currency, Currency> | null>[] = []

export interface PriceChartLimitPriceOptions {
  activeCurrency: Currency | undefined
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  metric: ChartMetric
  supplyVariant: SupplyVariant
  referenceLines?: PriceChartReferenceLine<Price<Currency, Currency> | null>[]
  onSelectLimitPrice?: (rate: Fraction) => void
}

// eslint-disable-next-line complexity
export function usePriceChartLimitPrice({
  activeCurrency,
  inputCurrency,
  outputCurrency,
  metric,
  supplyVariant,
  referenceLines = EMPTY_REFERENCE_LINES,
  onSelectLimitPrice,
}: PriceChartLimitPriceOptions): {
  referenceLines: PriceChartReferenceLine<number>[]
  onSelectPrice: ((price: number) => void) | undefined
} {
  const inputPrice = useUsdPrice(inputCurrency ? getWrappedToken(inputCurrency) : null)
  const outputPrice = useUsdPrice(outputCurrency ? getWrappedToken(outputCurrency) : null)
  const inputUsdPrice = inputPrice?.price ? Number(inputPrice.price.toSignificant(18)) : null
  const outputUsdPrice = outputPrice?.price ? Number(outputPrice.price.toSignificant(18)) : null
  const { data: supply } = useQuery({
    queryKey: [
      'priceChart',
      'limitPriceSupply',
      activeCurrency?.chainId,
      activeCurrency ? getAddressKey(getCurrencyAddress(activeCurrency)) : null,
      supplyVariant,
    ],
    queryFn: activeCurrency ? () => loadMarketCapSupply(activeCurrency, supplyVariant) : skipToken,
    enabled: metric === 'marketCap' && !!activeCurrency,
    retry: false,
    staleTime: 30_000,
  })
  const priceMultiplier = metric === 'marketCap' ? supply : 1
  const activeReferenceLines = useMemo(
    () =>
      priceMultiplier
        ? referenceLines.flatMap((line) => {
            const price = getActivePriceLimitLinePrice(
              activeCurrency,
              line.price,
              inputCurrency,
              outputCurrency,
              inputUsdPrice,
              outputUsdPrice,
            )
            return price === null
              ? []
              : [
                  {
                    ...line,
                    price: price * priceMultiplier,
                    label:
                      line.labels?.[activeCurrency && inputCurrency?.equals(activeCurrency) ? 'sell' : 'buy'] ??
                      line.label,
                  },
                ]
          })
        : [],
    [activeCurrency, inputCurrency, outputCurrency, inputUsdPrice, outputUsdPrice, priceMultiplier, referenceLines],
  )
  const handleSelectPrice = useCallback(
    (price: number) => {
      const selectedPrice = metric === 'marketCap' && supply ? price / supply : price
      const rate = getSelectedPriceLimitRate(
        activeCurrency,
        inputCurrency,
        outputCurrency,
        selectedPrice,
        inputUsdPrice,
        outputUsdPrice,
      )
      if (rate) onSelectLimitPrice?.(rate)
    },
    [activeCurrency, inputCurrency, outputCurrency, inputUsdPrice, outputUsdPrice, metric, onSelectLimitPrice, supply],
  )

  return {
    referenceLines: activeReferenceLines,
    onSelectPrice: onSelectLimitPrice && (metric === 'price' || Number(supply) > 0) ? handleSelectPrice : undefined,
  }
}
