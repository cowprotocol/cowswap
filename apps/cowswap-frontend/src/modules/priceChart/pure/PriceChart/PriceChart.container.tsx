import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'

import { useUsdPrice } from 'modules/usdAmount'

import { PriceChartPure } from './PriceChart.pure'
import { SimplePriceChartPure } from './SimplePriceChart.pure'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { loadCirculatingSupply } from '../../lib/loadPriceChartHistory.service'
import { getActivePriceLimitLinePrice, getSelectedPriceLimitRate } from '../../lib/priceLimitLine.utils'
import { createSwapChartSymbols } from '../../lib/symbolCatalog'
import { loadSavedPriceChartSelection, savePriceChartSelection } from '../../lib/tradingViewPersistence.utils'
import { priceChartModeAtom } from '../../state/priceChartModeAtom'

import type { PriceChartMetric } from '../../lib/priceChart.types'
import type { PriceChartContainerProps, PriceChartSelection } from '../../lib/tradingView.types'

interface EnabledPriceChartProps extends PriceChartContainerProps {
  isAdvancedPriceChartEnabled: boolean
}

interface MarketCapSupply {
  assetKey: string
  value: number | null
}

export function PriceChart({ ...props }: PriceChartContainerProps): ReactNode {
  const { isAdvancedPriceChartEnabled, isPriceChartEnabled } = usePriceChartFeatureFlags()

  if (!isPriceChartEnabled) return null

  return <EnabledPriceChart {...props} isAdvancedPriceChartEnabled={isAdvancedPriceChartEnabled} />
}

// eslint-disable-next-line max-lines-per-function
function EnabledPriceChart({
  inputCurrency,
  isAdvancedPriceChartEnabled,
  onSelectLimitPrice,
  outputCurrency,
  referenceLine,
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
  const activeAssetKey = activeSymbol
    ? `${activeSymbol.baseAsset.chainId}:${activeSymbol.baseAsset.address.toLowerCase()}`
    : null
  const referenceLinePrice = useMemo(
    () =>
      getActivePriceLimitLinePrice(
        activeSymbol,
        referenceLine?.price,
        inputCurrency,
        outputCurrency,
        inputUsdPrice,
        outputUsdPrice,
      ),
    [activeSymbol, inputCurrency, inputUsdPrice, outputCurrency, outputUsdPrice, referenceLine?.price],
  )
  const [marketCapSupply, setMarketCapSupply] = useState<MarketCapSupply>()
  const shouldLoadMarketCapSupply = metric === 'marketCap' && referenceLinePrice !== null

  useEffect(() => {
    if (!shouldLoadMarketCapSupply || !activeSymbol || !activeAssetKey) return

    let isCancelled = false

    void loadCirculatingSupply(activeSymbol.baseAsset)
      .then((value) => {
        if (!isCancelled) setMarketCapSupply({ assetKey: activeAssetKey, value })
      })
      .catch(() => {
        if (!isCancelled) setMarketCapSupply({ assetKey: activeAssetKey, value: null })
      })

    return () => {
      isCancelled = true
    }
  }, [activeAssetKey, activeSymbol, shouldLoadMarketCapSupply])

  const displayedReferenceLinePrice = useMemo(() => {
    if (referenceLinePrice === null || metric === 'price') return referenceLinePrice

    const circulatingSupply = marketCapSupply?.assetKey === activeAssetKey ? marketCapSupply.value : null

    if (circulatingSupply === null || circulatingSupply === undefined) return null

    const marketCap = referenceLinePrice * circulatingSupply

    return Number.isFinite(marketCap) ? marketCap : null
  }, [activeAssetKey, marketCapSupply, metric, referenceLinePrice])
  const activeReferenceLine = useMemo(
    () =>
      referenceLine && displayedReferenceLinePrice !== null
        ? { label: referenceLine.label, price: displayedReferenceLinePrice }
        : undefined,
    [displayedReferenceLinePrice, referenceLine],
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
    metric,
    onSelectMetric: setMetric,
    onSelectPrice: metric === 'price' && onSelectLimitPrice ? handleSelectPrice : undefined,
    onSelectSelection: handleSelectSelection,
    referenceLine: activeReferenceLine,
    sizeControl,
    symbols,
  }

  return chartMode === 'advanced' && isAdvancedPriceChartEnabled ? (
    <PriceChartPure {...chartProps} />
  ) : (
    <SimplePriceChartPure {...chartProps} />
  )
}
