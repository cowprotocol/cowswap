import { atom } from 'jotai'

export type OrdersFromApiStatus = 'idle' | 'loading' | 'success' | 'error'

export const ordersFromApiStatusAtom = atom<OrdersFromApiStatus>('idle')
