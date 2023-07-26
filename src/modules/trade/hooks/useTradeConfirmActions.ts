import { useSetAtom } from 'jotai'

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
  const setOpenTradeConfim = useSetAtom(setOpenTradeConfirmAtom)
  const setCloseTradeConfirm = useSetAtom(setCloseTradeConfirmAtom)
  const setErrorTradeConfirm = useSetAtom(setErrorTradeConfirmAtom)
  const setPendingTradeConfirm = useSetAtom(setPendingTradeConfirmAtom)
  const setTxHashTradeConfirm = useSetAtom(setTxHashTradeConfirmAtom)

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
