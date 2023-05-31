import { useUpdateAtom } from 'jotai/utils'

import {
  setCloseTradeConfirmAtom,
  setErrorTradeConfirmAtom,
  setOpenTradeConfirmAtom,
  setPendingTradeConfirmAtom,
  setTxHashTradeConfirmAtom,
} from '../state/tradeConfirmStateAtom'
import { TradeAmounts } from '../types/TradeAmounts'

export interface TradeConfirmActions {
  onSign(pendingTrade: TradeAmounts): void
  onError(error: string): void
  onSuccess(transactionHash: string): void
  onOpen(): void
  onDismiss(): void
}

export function useTradeConfirmActions(): TradeConfirmActions {
  const setOpenTradeConfim = useUpdateAtom(setOpenTradeConfirmAtom)
  const setCloseTradeConfirm = useUpdateAtom(setCloseTradeConfirmAtom)
  const setErrorTradeConfirm = useUpdateAtom(setErrorTradeConfirmAtom)
  const setPendingTradeConfirm = useUpdateAtom(setPendingTradeConfirmAtom)
  const setTxHashTradeConfirm = useUpdateAtom(setTxHashTradeConfirmAtom)

  return {
    onSign(pendingTrade: TradeAmounts) {
      setPendingTradeConfirm(pendingTrade)
    },
    onError(error: string) {
      setErrorTradeConfirm(error)
    },
    onSuccess(transactionHash: string) {
      setTxHashTradeConfirm(transactionHash)
    },
    onOpen() {
      setOpenTradeConfim()
    },
    onDismiss() {
      setCloseTradeConfirm()
    },
  }
}
