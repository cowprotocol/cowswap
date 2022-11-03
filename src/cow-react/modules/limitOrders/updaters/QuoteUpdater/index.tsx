import { useFetchMarketPrice } from './hooks/useFetchMarketPrice'

export function QuoteUpdater() {
  useFetchMarketPrice()

  return null
}
