import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo, useState } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'

import { useUsdPrice } from 'modules/usdAmount'

import { PriceChartPure } from './PriceChart.pure'
import { SimplePriceChartPure } from './SimplePriceChart.pure'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { getActivePriceLimitLinePrice, getSelectedPriceLimitRate } from '../../lib/priceLimitLine.utils'
import { createSwapChartSymbols } from '../../lib/symbolCatalog'
import { loadSavedPriceChartSelection, savePriceChartSelection } from '../../lib/tradingViewPersistence.utils'
import { priceChartModeAtom } from '../../state/priceChartModeAtom'

import type { PriceChartMetric } from '../../lib/priceChart.types'
import type { PriceChartContainerProps, PriceChartSelection } from '../../lib/tradingView.types'

export function PriceChart({ ...props }: PriceChartContainerProps): ReactNode {
  const { isAdvancedPriceChartEnabled, isPriceChartEnabled } = usePriceChartFeatureFlags()

  if (!isPriceChartEnabled) return null

  return <EnabledPriceChart {...props} isAdvancedPriceChartEnabled={isAdvancedPriceChartEnabled} />
}

interface EnabledPriceChartProps extends PriceChartContainerProps {
  isAdvancedPriceChartEnabled: boolean
}

function EnabledPriceChart({
  inputCurrency,
  isAdvancedPriceChartEnabled,
  limitPrice,
  onSelectLimitPrice,
  outputCurrency,
  sizeControl,
}: EnabledPriceChartProps): ReactNode {
  const chartMode = useAtomValue(priceChartModeAtom)
  const [metric, setMetric] = useState<PriceChartMetric>('price')
  const inputUsdPriceState = useUsdPrice(inputCurrency ? getWrappedToken(inputCurrency) : null)
  const outputUsdPriceState = useUsdPrice(outputCurrency ? getWrappedToken(outputCurrency) : null)
  const symbols = useMemo(() => createSwapChartSymbols(inputCurrency, outputCurrency), [inputCurrency, outputCurrency])
  const [selectedSelection, setSelectedSelection] = useState(() => loadSavedPriceChartSelection())
  const inputUsdPrice = useMemo(() => {
    const price = inputUsdPriceState?.price ? Number(inputUsdPriceState.price.toSignificant(18)) : null

    return price && Number.isFinite(price) && price > 0 ? price : null
  }, [inputUsdPriceState])
  const outputUsdPrice = useMemo(() => {
    const price = outputUsdPriceState?.price ? Number(outputUsdPriceState.price.toSignificant(18)) : null

    return price && Number.isFinite(price) && price > 0 ? price : null
  }, [outputUsdPriceState])

  const activeSymbol = useMemo(
    () => symbols.find((symbol) => symbol.selection === selectedSelection) || symbols[0],
    [selectedSelection, symbols],
  )
  const limitLinePrice = useMemo(
    () =>
      getActivePriceLimitLinePrice(
        activeSymbol,
        limitPrice,
        inputCurrency,
        outputCurrency,
        inputUsdPrice,
        outputUsdPrice,
      ),
    [activeSymbol, inputCurrency, inputUsdPrice, limitPrice, outputCurrency, outputUsdPrice],
  )
  const handleSelectSelection = useCallback((selection: PriceChartSelection) => {
    setSelectedSelection(selection)
    savePriceChartSelection(selection)
  }, [])
  const handleSelectPrice = useCallback(
    (selectedPrice: number) => {
      const nextRate = getSelectedPriceLimitRate(
        activeSymbol,
        inputCurrency,
        outputCurrency,
        selectedPrice,
        inputUsdPrice,
        outputUsdPrice,
      )

      if (!nextRate || !onSelectLimitPrice) {
        return
      }

      onSelectLimitPrice(nextRate)
    },
    [activeSymbol, inputCurrency, inputUsdPrice, onSelectLimitPrice, outputCurrency, outputUsdPrice],
  )

  const chartProps = {
    activeSymbol,
    executionLinePrice: null,
    limitLinePrice,
    metric,
    onSelectMetric: setMetric,
    onSelectPrice: handleSelectPrice,
    onSelectSelection: handleSelectSelection,
    sizeControl,
    symbols,
  }

  return chartMode === 'advanced' && isAdvancedPriceChartEnabled ? (
    <PriceChartPure {...chartProps} />
  ) : (
    <SimplePriceChartPure {...chartProps} />
  )
}
