import { swapConfirmAtom } from 'pages/Swap/state/swapConfirmAtom'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import TradeGp from 'state/swap/TradeGp'

export interface SwapConfirmManager {
  setSwapError(swapErrorMessage: string): void
  openSwapConfirmModal(tradeToConfirm: TradeGp): void
  acceptRateUpdates(tradeToConfirm: TradeGp): void
  closeSwapConfirm(): void
  sendTransaction(tradeToConfirm: TradeGp): void
  transactionSent(txHash: string): void
}

export function useSwapConfirmManager(): SwapConfirmManager {
  const [swapConfirmState, setSwapConfirmState] = useAtom(swapConfirmAtom)

  return useMemo(
    () => ({
      setSwapError(swapErrorMessage: string) {
        const state = { ...swapConfirmState, swapErrorMessage }
        console.log('[Swap confirm state] setSwapError: ', state)
        setSwapConfirmState(state)
      },
      openSwapConfirmModal(tradeToConfirm: TradeGp) {
        const state = {
          tradeToConfirm,
          attemptingTxn: false,
          swapErrorMessage: undefined,
          showConfirm: true,
          txHash: undefined,
        }
        console.log('[Swap confirm state] openSwapConfirmModal: ', state)
        setSwapConfirmState(state)
      },
      acceptRateUpdates(tradeToConfirm: TradeGp) {
        const state = { ...swapConfirmState, tradeToConfirm }
        console.log('[Swap confirm state] acceptRateUpdates: ', state)
        setSwapConfirmState(state)
      },
      closeSwapConfirm() {
        const state = { ...swapConfirmState, showConfirm: false }
        console.log('[Swap confirm state] closeSwapConfirm: ', state)
        setSwapConfirmState(state)
      },
      sendTransaction(tradeToConfirm: TradeGp) {
        const state = {
          tradeToConfirm,
          attemptingTxn: true,
          swapErrorMessage: undefined,
          showConfirm: true,
          txHash: undefined,
        }
        console.log('[Swap confirm state] sendTransaction: ', state)
        setSwapConfirmState(state)
      },
      transactionSent(txHash: string) {
        const state = { ...swapConfirmState, attemptingTxn: false, swapErrorMessage: undefined, txHash }
        console.log('[Swap confirm state] transactionSent: ', state)
        setSwapConfirmState(state)
      },
    }),
    [swapConfirmState, setSwapConfirmState]
  )
}
