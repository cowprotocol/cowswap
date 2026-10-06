import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo, useState } from 'react'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { createChartAssets } from '../../lib/chartAssets.utils'
import { loadSavedPriceChartSelection, savePriceChartSelection } from '../../lib/chartSelection.utils'
import { SimplePriceChart } from '../../simple/SimplePriceChart'
import { priceChartSupplyBasisAtom } from '../../state/priceChartSupplyBasisAtom'

import type { PriceChartMetric, PriceChartContainerProps, PriceChartSelection } from '../../lib/priceChart.types'

export function PriceChart(props: PriceChartContainerProps): ReactNode {
  const { isPriceChartEnabled } = usePriceChartFeatureFlags()
  if (!isPriceChartEnabled) return null
  return <EnabledPriceChart {...props} />
}

function EnabledPriceChart({ inputCurrency, outputCurrency, sizeControl }: PriceChartContainerProps): ReactNode {
  const supplyBasis = useAtomValue(priceChartSupplyBasisAtom)
  const [metric, setMetric] = useState<PriceChartMetric>('price')
  const assets = useMemo(() => createChartAssets(inputCurrency, outputCurrency), [inputCurrency, outputCurrency])
  const [selectedSelection, setSelectedSelection] = useState(() => loadSavedPriceChartSelection())
  const activeAsset = useMemo(
    () => assets.find((asset) => asset.selection === selectedSelection) || assets[0],
    [selectedSelection, assets],
  )
  const handleSelectSelection = useCallback((selection: PriceChartSelection) => {
    setSelectedSelection(selection)
    savePriceChartSelection(selection)
  }, [])
  const chartProps = {
    activeAsset,
    metric,
    onSelectMetric: setMetric,
    onSelectSelection: handleSelectSelection,
    sizeControl,
    assets,
    supplyBasis,
  }
  return <SimplePriceChart {...chartProps} />
}
