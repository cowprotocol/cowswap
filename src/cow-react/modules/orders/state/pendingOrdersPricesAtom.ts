import { atom } from 'jotai'
import { Currency, Price } from '@uniswap/sdk-core'

export interface PendingOrderPrices {
  marketPrice: Price<Currency, Currency>
  executionPrice: Price<Currency, Currency>
  lastUpdateTimestamp: number
}

// When the price is null, it means that we got error from the quote API
export type PendingOrdersPrices = { [orderId: string]: PendingOrderPrices | null }

export const pendingOrdersPricesAtom = atom<PendingOrdersPrices>({})

export const updatePendingOrderPricesAtom = atom(
  null,
  (get, set, { orderId, data }: { orderId: string; data: PendingOrderPrices | null }) => {
    set(pendingOrdersPricesAtom, () => {
      const prevState = get(pendingOrdersPricesAtom)

      return { ...prevState, [orderId]: data }
    })
  }
)
