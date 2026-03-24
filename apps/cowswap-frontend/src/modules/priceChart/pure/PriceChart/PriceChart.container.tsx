import { ReactNode, useEffect, useMemo, useState } from 'react'

import { PriceChartPure } from './PriceChart.pure'

import { createSwapChartSymbols, getDefaultChartTicker } from '../../lib/symbolCatalog'

import type { PriceChartContainerProps } from '../../lib/tradingView.types'

export function PriceChart({ inputCurrency, outputCurrency }: PriceChartContainerProps): ReactNode {
  const symbols = useMemo(() => createSwapChartSymbols(inputCurrency, outputCurrency), [inputCurrency, outputCurrency])
  const defaultTicker = useMemo(() => getDefaultChartTicker(symbols), [symbols])
  const [activeTicker, setActiveTicker] = useState<string>(defaultTicker || '')

  useEffect(() => {
    if (!symbols.length) {
      setActiveTicker('')
      return
    }

    setActiveTicker((currentTicker) => {
      if (currentTicker && symbols.some((symbol) => symbol.ticker === currentTicker)) {
        return currentTicker
      }

      return defaultTicker || symbols[0].ticker
    })
  }, [defaultTicker, symbols])

  return <PriceChartPure activeTicker={activeTicker} onSelectTicker={setActiveTicker} symbols={symbols} />
}
