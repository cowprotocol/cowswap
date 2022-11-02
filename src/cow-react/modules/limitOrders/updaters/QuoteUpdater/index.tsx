import { useGetMarketPrice } from './hooks/useGetMarketPrice'

export function QuoteUpdater() {
  useGetMarketPrice()

  return null
}
