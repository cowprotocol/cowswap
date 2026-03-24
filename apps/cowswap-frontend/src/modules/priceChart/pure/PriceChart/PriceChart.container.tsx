import { ReactNode, useCallback, useMemo, useState } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'

import { useUsdPrice } from 'modules/usdAmount'

import { PriceChartPure } from './PriceChart.pure'

import { getActivePriceLimitLinePrice, getSelectedPriceLimitRate } from '../../lib/priceLimitLine.utils'
import {
  createSwapChartSymbols,
  getChartFormatByTicker,
  getChartTickerByFormat,
  getDefaultPriceChartFormat,
} from '../../lib/symbolCatalog'
import { loadSavedPriceChartFormat, savePriceChartFormat } from '../../lib/tradingViewPersistence.utils'

import type { PriceChartContainerProps } from '../../lib/tradingView.types'

export function PriceChart({
  inputCurrency,
  limitPrice,
  onSelectLimitPrice,
  outputCurrency,
}: PriceChartContainerProps): ReactNode {
  const inputUsdPriceState = useUsdPrice(inputCurrency ? getWrappedToken(inputCurrency) : null)
  const outputUsdPriceState = useUsdPrice(outputCurrency ? getWrappedToken(outputCurrency) : null)
  const symbols = useMemo(() => createSwapChartSymbols(inputCurrency, outputCurrency), [inputCurrency, outputCurrency])
  const defaultFormat = useMemo(() => getDefaultPriceChartFormat(symbols), [symbols])
  const [selectedFormat, setSelectedFormat] = useState(() => loadSavedPriceChartFormat())
  const inputUsdPrice = useMemo(() => {
    const price = inputUsdPriceState?.price ? Number(inputUsdPriceState.price.toSignificant(18)) : null

    return price && Number.isFinite(price) && price > 0 ? price : null
  }, [inputUsdPriceState])
  const outputUsdPrice = useMemo(() => {
    const price = outputUsdPriceState?.price ? Number(outputUsdPriceState.price.toSignificant(18)) : null

    return price && Number.isFinite(price) && price > 0 ? price : null
  }, [outputUsdPriceState])

  const activeTicker = useMemo(() => {
    if (!symbols.length) {
      return ''
    }

    return (
      getChartTickerByFormat(symbols, selectedFormat) ||
      getChartTickerByFormat(symbols, defaultFormat) ||
      symbols[0]?.ticker ||
      ''
    )
  }, [defaultFormat, selectedFormat, symbols])
  const limitLinePrice = useMemo(
    () =>
      getActivePriceLimitLinePrice(
        activeTicker,
        symbols,
        limitPrice,
        inputCurrency,
        outputCurrency,
        inputUsdPrice,
        outputUsdPrice,
      ),
    [activeTicker, inputCurrency, inputUsdPrice, limitPrice, outputCurrency, outputUsdPrice, symbols],
  )
  const handleSelectTicker = useCallback(
    (ticker: string) => {
      const format = getChartFormatByTicker(symbols, ticker)

      if (!format) return

      setSelectedFormat(format)
      savePriceChartFormat(format)
    },
    [symbols],
  )
  const handleSelectPrice = useCallback(
    (selectedPrice: number) => {
      const nextRate = getSelectedPriceLimitRate(
        activeTicker,
        symbols,
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
    [activeTicker, inputCurrency, inputUsdPrice, onSelectLimitPrice, outputCurrency, outputUsdPrice, symbols],
  )

  return (
    <PriceChartPure
      activeTicker={activeTicker}
      executionLinePrice={null}
      limitLinePrice={limitLinePrice}
      onSelectPrice={handleSelectPrice}
      onSelectTicker={handleSelectTicker}
      symbols={symbols}
    />
  )
}
