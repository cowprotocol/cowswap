import { PricePoint } from '@/components/Chart'
import { useMemo } from 'react'

export function isPricePoint(p: PricePoint | null): p is PricePoint {
  return p !== null
}

export function usePriceHistory(tokenPriceData: any): PricePoint[] | undefined {
  // Appends the current price to the end of the priceHistory array
  return useMemo(() => {
    if (!tokenPriceData) return null

    const market = tokenPriceData.token?.market
    const priceHistory = market?.priceHistory?.filter(isPricePoint)
    const currentPrice = market?.price?.value
    if (Array.isArray(priceHistory) && currentPrice !== undefined) {
      const timestamp = Date.now() / 1000
      return [...priceHistory, { timestamp, value: currentPrice }]
    }

    return priceHistory
  }, [tokenPriceData])
}
