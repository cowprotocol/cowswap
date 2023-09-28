import { atom } from 'jotai'

import TradeGp from 'legacy/state/swap/TradeGp'

export interface SwapConfirmState {
  showConfirm: boolean
  tradeToConfirm: TradeGp | undefined
  attemptingTxn: boolean
  swapErrorMessage: string | undefined
  txHash: string | undefined
  permitSignatureState: undefined | 'requested' | 'signed'
}

export const swapConfirmAtom = atom<SwapConfirmState>({
  showConfirm: false,
  tradeToConfirm: undefined,
  attemptingTxn: false,
  swapErrorMessage: undefined,
  txHash: undefined,
  permitSignatureState: undefined,
})
