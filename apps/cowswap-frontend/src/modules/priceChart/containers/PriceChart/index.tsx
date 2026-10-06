import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo, useState } from 'react'

import type { Currency } from '@cowprotocol/currency'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { createChartAssets, getChartAssetKey } from '../../lib/chartAssets.utils'
import { loadSavedChartPair, saveChartPair } from '../../lib/chartSelection.utils'
import { SimplePriceChart } from '../../simple/SimplePriceChart'
import { priceChartSupplyVariantAtom } from '../../state/priceChartSupplyVariantAtom'

import type { ChartMetric, ChartAsset, ChartPair, ExpansionControl } from '../../lib/chart.types'

export interface PriceChartProps {
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  sizeControl?: ExpansionControl
}

export function PriceChart({ inputCurrency, outputCurrency, sizeControl }: PriceChartProps): ReactNode {
  const { isPriceChartEnabled } = usePriceChartFeatureFlags()
  const supplyVariant = useAtomValue(priceChartSupplyVariantAtom)
  const [metric, setMetric] = useState<ChartMetric>('price')
  const assets = useMemo(() => createChartAssets(inputCurrency, outputCurrency), [inputCurrency, outputCurrency])
  const [selectedPair, setSelectedPair] = useState<ChartPair>(() => loadSavedChartPair() ?? 'sell-usd')
  const activeAsset = selectedPair === 'buy-usd' ? assets[1] || assets[0] : assets[0]
  const handleSelectAsset = useCallback(
    (asset: ChartAsset) => {
      const pair = assets[0] && getChartAssetKey(asset) === getChartAssetKey(assets[0]) ? 'sell-usd' : 'buy-usd'
      setSelectedPair(pair)
      saveChartPair(pair)
    },
    [assets],
  )
  const chartProps = {
    activeAsset,
    metric,
    onSelectMetric: setMetric,
    onSelectAsset: handleSelectAsset,
    sizeControl,
    assets,
    supplyVariant,
  }
  if (!isPriceChartEnabled) return null

  return <SimplePriceChart {...chartProps} />
}
