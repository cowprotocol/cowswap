import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'

import { useUsdPrice } from 'modules/usdAmount'

import { PriceChartPure } from './PriceChart.pure'
import { SimplePriceChartPure } from './SimplePriceChart.pure'

import { useExecutedOrderChartMarkers } from '../../hooks/useExecutedOrderChartMarkers'
import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { loadMarketCapSupply } from '../../lib/loadPriceChartHistory.service'
import { getActivePriceLimitLinePrice, getSelectedPriceLimitRate } from '../../lib/priceLimitLine.utils'
import { createSwapChartSymbols } from '../../lib/symbolCatalog'
import { loadSavedPriceChartSelection, savePriceChartSelection } from '../../lib/tradingViewPersistence.utils'
import { priceChartModeAtom } from '../../state/priceChartModeAtom'
import { priceChartSupplyBasisAtom } from '../../state/priceChartSupplyBasisAtom'

import type { PriceChartMetric } from '../../lib/priceChart.types'
import type { PriceChartContainerProps, PriceChartSelection } from '../../lib/tradingView.types'

interface EnabledPriceChartProps extends PriceChartContainerProps {
  isAdvancedPriceChartEnabled: boolean
}

interface LoadedMarketCapSupply {
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
  referenceLines = [],
  sizeControl,
}: EnabledPriceChartProps): ReactNode {
  const chartMode = useAtomValue(priceChartModeAtom)
  const supplyBasis = useAtomValue(priceChartSupplyBasisAtom)
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
  const executionMarkers = useExecutedOrderChartMarkers({ activeSymbol, inputCurrency, outputCurrency })
  const activeAssetKey = activeSymbol
    ? `${activeSymbol.baseAsset.chainId}:${getAddressKey(activeSymbol.baseAsset.address)}`
    : null
  const activeSupplyKey = activeAssetKey ? `${activeAssetKey}:${supplyBasis}` : null
  const activeReferenceLines = useMemo(
    () =>
      metric === 'price'
        ? referenceLines.flatMap((referenceLine) => {
            const price = getActivePriceLimitLinePrice(
              activeSymbol,
              referenceLine.price,
              inputCurrency,
              outputCurrency,
              inputUsdPrice,
              outputUsdPrice,
            )

            const label = activeSymbol
              ? referenceLine.labels?.[activeSymbol.selection] || referenceLine.label
              : referenceLine.label

            return price === null ? [] : [{ ...referenceLine, label, price }]
          })
        : [],
    [activeSymbol, inputCurrency, inputUsdPrice, metric, outputCurrency, outputUsdPrice, referenceLines],
  )
  const [marketCapSupply, setMarketCapSupply] = useState<LoadedMarketCapSupply>()
  const shouldLoadMarketCapSupply = metric === 'marketCap' && onSelectLimitPrice !== undefined

  useEffect(() => {
    if (!shouldLoadMarketCapSupply || !activeSymbol || !activeSupplyKey) return

    let isCancelled = false

    void loadMarketCapSupply(activeSymbol.baseAsset, supplyBasis)
      .then((value) => {
        if (!isCancelled) setMarketCapSupply({ assetKey: activeSupplyKey, value })
      })
      .catch(() => {
        if (!isCancelled) setMarketCapSupply({ assetKey: activeSupplyKey, value: null })
      })

    return () => {
      isCancelled = true
    }
  }, [activeSupplyKey, activeSymbol, shouldLoadMarketCapSupply, supplyBasis])

  const supply = marketCapSupply?.assetKey === activeSupplyKey ? marketCapSupply.value : null
  const handleSelectSelection = useCallback((selection: PriceChartSelection) => {
    setSelectedSelection(selection)
    savePriceChartSelection(selection)
  }, [])
  const handleSelectPrice = useCallback(
    (selectedPrice: number) => {
      let selectedUsdPrice = selectedPrice

      if (metric === 'marketCap') {
        if (!supply) return
        selectedUsdPrice /= supply
      }

      const nextRate = getSelectedPriceLimitRate(
        activeSymbol,
        inputCurrency,
        outputCurrency,
        selectedUsdPrice,
        inputUsdPrice,
        outputUsdPrice,
      )

      if (!nextRate || !onSelectLimitPrice) {
        return
      }

      onSelectLimitPrice(nextRate)
    },
    [activeSymbol, inputCurrency, inputUsdPrice, metric, onSelectLimitPrice, outputCurrency, outputUsdPrice, supply],
  )
  const canSelectPrice = onSelectLimitPrice !== undefined && (metric === 'price' || (supply !== null && supply > 0))

  const chartProps = {
    activeSymbol,
    executionMarkers: metric === 'price' ? executionMarkers : [],
    executionLinePrice: null,
    metric,
    onSelectMetric: setMetric,
    onSelectPrice: canSelectPrice ? handleSelectPrice : undefined,
    onSelectSelection: handleSelectSelection,
    referenceLines: activeReferenceLines,
    sizeControl,
    symbols,
    supplyBasis,
  }

  return chartMode === 'advanced' && isAdvancedPriceChartEnabled ? (
    <PriceChartPure {...chartProps} />
  ) : (
    <SimplePriceChartPure {...chartProps} />
  )
}
