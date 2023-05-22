import { atom } from 'jotai'

interface LimitOrderConfirmationState {
  isPending: boolean
  orderHash: string | null
}

export const limitOrdersConfirmState = atom<LimitOrderConfirmationState>({
  isPending: false,
  orderHash: null,
})
