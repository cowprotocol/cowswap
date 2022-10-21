import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type OrderPriceDifference = {
  currentPrice: string
  orderPrice: string
  percentageDifference: string
}

/**
 * Base atom that stores difference between the order and the current price to know the out of range price
 */
export const orderPriceDifferenceAtom = atomWithStorage<OrderPriceDifference | null>('orderPriceDifference', null)

export const handleOrderPriceDifferenceAtom = atom(
  null,
  (_get, set, orderPriceOutRange: OrderPriceDifference | null) => {
    set(orderPriceDifferenceAtom, (prev) => {
      if (!prev) return orderPriceOutRange

      return { ...prev, orderPriceOutRange }
    })
  }
)
