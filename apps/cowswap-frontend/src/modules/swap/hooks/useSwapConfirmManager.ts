import { useAtom } from 'jotai'
import { useMemo } from 'react'

import TradeGp from 'legacy/state/swap/TradeGp'
import { useExpertModeManager } from 'legacy/state/user/hooks'

import { swapConfirmAtom } from 'modules/swap/state/swapConfirmAtom'

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
  const [isExpertMode] = useExpertModeManager()

  return useMemo(
    () => ({
      setSwapError(swapErrorMessage: string) {
        const state = { ...swapConfirmState, swapErrorMessage }
        console.debug('[Swap confirm state] setSwapError: ', state)
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
        console.debug('[Swap confirm state] openSwapConfirmModal: ', state)
        setSwapConfirmState(state)
      },
      acceptRateUpdates(tradeToConfirm: TradeGp) {
        const state = { ...swapConfirmState, tradeToConfirm }
        console.debug('[Swap confirm state] acceptRateUpdates: ', state)
        setSwapConfirmState(state)
      },
      closeSwapConfirm() {
        const state = { ...swapConfirmState, showConfirm: false }
        console.debug('[Swap confirm state] closeSwapConfirm: ', state)
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
        console.debug('[Swap confirm state] sendTransaction: ', state)
        setSwapConfirmState(state)
      },
      transactionSent(txHash: string) {
        const state = {
          ...swapConfirmState,
          attemptingTxn: false,
          swapErrorMessage: undefined,
          showConfirm: !isExpertMode,
          txHash,
        }
        console.debug('[Swap confirm state] transactionSent: ', state)
        setSwapConfirmState(state)
      },
    }),
    [swapConfirmState, setSwapConfirmState, isExpertMode]
  )
}
