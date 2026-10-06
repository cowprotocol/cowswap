import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo, useState } from 'react'

import { SimplePriceChartPure } from './SimplePriceChart.pure'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { createSwapChartSymbols } from '../../lib/symbolCatalog'
import { loadSavedPriceChartSelection, savePriceChartSelection } from '../../lib/tradingViewPersistence.utils'
import { priceChartSupplyBasisAtom } from '../../state/priceChartSupplyBasisAtom'

import type { PriceChartMetric } from '../../lib/priceChart.types'
import type { PriceChartContainerProps, PriceChartSelection } from '../../lib/tradingView.types'

export function PriceChart(props: PriceChartContainerProps): ReactNode {
  const { isPriceChartEnabled } = usePriceChartFeatureFlags()
  if (!isPriceChartEnabled) return null
  return <EnabledPriceChart {...props} />
}

function EnabledPriceChart({ inputCurrency, outputCurrency, sizeControl }: PriceChartContainerProps): ReactNode {
  const supplyBasis = useAtomValue(priceChartSupplyBasisAtom)
  const [metric, setMetric] = useState<PriceChartMetric>('price')
  const symbols = useMemo(() => createSwapChartSymbols(inputCurrency, outputCurrency), [inputCurrency, outputCurrency])
  const [selectedSelection, setSelectedSelection] = useState(() => loadSavedPriceChartSelection())
  const activeSymbol = useMemo(
    () => symbols.find((symbol) => symbol.selection === selectedSelection) || symbols[0],
    [selectedSelection, symbols],
  )
  const handleSelectSelection = useCallback((selection: PriceChartSelection) => {
    setSelectedSelection(selection)
    savePriceChartSelection(selection)
  }, [])
  const chartProps = {
    activeSymbol,
    metric,
    onSelectMetric: setMetric,
    onSelectSelection: handleSelectSelection,
    sizeControl,
    symbols,
    supplyBasis,
  }
  return <SimplePriceChartPure {...chartProps} />
}
