import { useUpdateAtom } from 'jotai/utils'

import { updateTradeConfirmStateAtom } from '../state/tradeConfirmStateAtom'
import { TradeAmounts } from '../types/TradeAmounts'

export interface TradeConfirmActions {
  onSign(pendingTrade: TradeAmounts): void
  onError(error: string): void
  onSuccess(transactionHash: string): void
  onOpen(): void
  onDismiss(): void
}

export function useTradeConfirmActions(): TradeConfirmActions {
  const updateTradeConfirm = useUpdateAtom(updateTradeConfirmStateAtom)

  return {
    onSign(pendingTrade: TradeAmounts) {
      updateTradeConfirm({ pendingTrade })
    },
    onError(error: string) {
      updateTradeConfirm({ error })
    },
    onSuccess(transactionHash: string) {
      updateTradeConfirm({ transactionHash })
    },
    onOpen() {
      updateTradeConfirm({ isOpen: true })
    },
    onDismiss() {
      updateTradeConfirm({ isOpen: false })
    },
  }
}
