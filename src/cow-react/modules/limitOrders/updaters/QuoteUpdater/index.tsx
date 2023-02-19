import { useFetchMarketPrice } from './hooks/useFetchMarketPrice'

// TODO: rename it to MarketPriceUpdater
export function QuoteUpdater() {
  useFetchMarketPrice()

  return null
}
