import { useCallback, useMemo } from 'react'

import { skipToken, useQuery } from '@tanstack/react-query'

import { getCurrencyAddress, getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import type { Currency, Fraction, Price } from '@cowprotocol/currency'

import { useUsdPrice } from 'modules/usdAmount'

import { loadMarketCapSupply } from '../lib/loadPriceChartHistory'
import {
  getActivePriceLimitLinePrice,
  getSelectedPriceLimitRate,
  getPriceChartUsdConversion,
} from '../lib/priceChartLimitPrice.utils'

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
  const conversion = useUsdConversion(activeCurrency, inputCurrency, outputCurrency)
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
            const price = getActivePriceLimitLinePrice(line.price, conversion)
            return price === null
              ? []
              : [
                  {
                    ...line,
                    price: price * priceMultiplier,
                    label: line.labels?.[conversion?.side ?? 'buy'] ?? line.label,
                  },
                ]
          })
        : [],
    [conversion, priceMultiplier, referenceLines],
  )
  const handleSelectPrice = useCallback(
    (price: number) => {
      if (!priceMultiplier) return
      const rate = getSelectedPriceLimitRate(price / priceMultiplier, conversion)
      if (rate) onSelectLimitPrice?.(rate)
    },
    [conversion, onSelectLimitPrice, priceMultiplier],
  )

  return {
    referenceLines: activeReferenceLines,
    onSelectPrice: onSelectLimitPrice && conversion && priceMultiplier ? handleSelectPrice : undefined,
  }
}

function useUsdConversion(
  activeCurrency: Currency | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
): ReturnType<typeof getPriceChartUsdConversion> {
  const inputPrice = useUsdPrice(inputCurrency ? getWrappedToken(inputCurrency) : null)
  const outputPrice = useUsdPrice(outputCurrency ? getWrappedToken(outputCurrency) : null)
  const inputUsdPrice = inputPrice?.price ? Number(inputPrice.price.toSignificant(18)) : null
  const outputUsdPrice = outputPrice?.price ? Number(outputPrice.price.toSignificant(18)) : null
  return useMemo(
    () => getPriceChartUsdConversion(activeCurrency, inputCurrency, outputCurrency, inputUsdPrice, outputUsdPrice),
    [activeCurrency, inputCurrency, outputCurrency, inputUsdPrice, outputUsdPrice],
  )
}
