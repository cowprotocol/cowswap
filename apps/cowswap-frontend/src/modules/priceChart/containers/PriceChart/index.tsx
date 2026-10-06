import { useAtom, useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo, useState } from 'react'

import type { Currency } from '@cowprotocol/currency'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { SimplePriceChart } from '../../simple/SimplePriceChart'
import { priceChartPairAtom } from '../../state/priceChartPairAtom'
import { priceChartSupplyVariantAtom } from '../../state/priceChartSupplyVariantAtom'

import type { ChartMetric, ExpansionControl } from '../../lib/chart.types'

export interface PriceChartProps {
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  sizeControl?: ExpansionControl
}

export function PriceChart({ inputCurrency, outputCurrency, sizeControl }: PriceChartProps): ReactNode {
  const { isPriceChartEnabled } = usePriceChartFeatureFlags()
  const supplyVariant = useAtomValue(priceChartSupplyVariantAtom)
  const [metric, setMetric] = useState<ChartMetric>('price')
  const currencies = useMemo(
    () => (inputCurrency && outputCurrency ? [inputCurrency, outputCurrency] : []),
    [inputCurrency, outputCurrency],
  )
  const [selectedPair, setSelectedPair] = useAtom(priceChartPairAtom)
  const activeCurrency = selectedPair === 'buy-usd' ? currencies[1] : currencies[0]
  const handleSelectCurrency = useCallback(
    (currency: Currency) => {
      const pair = inputCurrency?.equals(currency) ? 'sell-usd' : 'buy-usd'
      setSelectedPair(pair)
    },
    [inputCurrency, setSelectedPair],
  )
  const chartProps = {
    activeCurrency,
    metric,
    onSelectMetric: setMetric,
    onSelectCurrency: handleSelectCurrency,
    sizeControl,
    currencies,
    supplyVariant,
  }
  if (!isPriceChartEnabled) return null

  return <SimplePriceChart {...chartProps} />
}
