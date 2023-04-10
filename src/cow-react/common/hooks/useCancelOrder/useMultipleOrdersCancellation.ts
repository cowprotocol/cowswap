import { useCallback } from 'react'
import { Order } from 'state/orders/actions'

// TODO
export function useMultipleOrdersCancellation() {
  return useCallback((orders: Order[]) => {
    console.log('multipleCancellation', orders)
  }, [])
}
