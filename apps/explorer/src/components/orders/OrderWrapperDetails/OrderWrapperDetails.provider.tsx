import { createContext, PropsWithChildren, useContext, ReactNode } from 'react'

import { Order } from '../../../api/operator'

export const OrderCtx = createContext<Order | null>(null)

export interface OrderCtxProviderProps extends PropsWithChildren {
  order: Order | null
}

export function OrderCtxProvider({ order, children }: OrderCtxProviderProps): ReactNode {
  return <OrderCtx.Provider value={order}>{children}</OrderCtx.Provider>
}

export function useOrderContext(): Order | null {
  return useContext(OrderCtx)
}
