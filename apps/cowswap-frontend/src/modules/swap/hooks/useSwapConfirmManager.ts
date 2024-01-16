import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import TradeGp from 'legacy/state/swap/TradeGp'
import { useExpertModeManager } from 'legacy/state/user/hooks'

import { swapConfirmAtom, SwapConfirmState } from 'modules/swap/state/swapConfirmAtom'

export interface SwapConfirmManager {
  setSwapError(swapErrorMessage: string): void
  openSwapConfirmModal(tradeToConfirm: TradeGp, needsPermitSignature?: boolean): void
  acceptRateUpdates(tradeToConfirm: TradeGp): void
  closeSwapConfirm(): void
  sendTransaction(tradeToConfirm: TradeGp): void
  transactionSent(txHash: string): void
  requestPermitSignature(): void
  permitSigned(): void
}

export function useSwapConfirmManager(): SwapConfirmManager {
  const setSwapConfirmState = useSetAtom(swapConfirmAtom)
  const [isExpertMode] = useExpertModeManager()

  return useMemo(
    () => ({
      setSwapError(swapErrorMessage: string) {
        setSwapConfirmState((prev) => {
          const state = { ...prev, swapErrorMessage, attemptingTxn: false, permitSignatureState: undefined }
          console.debug('[Swap confirm state] setSwapError: ', state)
          return state
        })
      },
      openSwapConfirmModal(tradeToConfirm: TradeGp) {
        const state: SwapConfirmState = {
          tradeToConfirm,
          attemptingTxn: false,
          swapErrorMessage: undefined,
          showConfirm: true,
          txHash: undefined,
          permitSignatureState: undefined,
        }
        console.debug('[Swap confirm state] openSwapConfirmModal: ', state)
        setSwapConfirmState(state)
      },
      acceptRateUpdates(tradeToConfirm: TradeGp) {
        setSwapConfirmState((prev) => {
          const state = { ...prev, tradeToConfirm }
          console.debug('[Swap confirm state] acceptRateUpdates: ', state)
          return state
        })
      },
      requestPermitSignature() {
        setSwapConfirmState((prev) => {
          const state: SwapConfirmState = { ...prev, permitSignatureState: 'requested' }
          console.debug('[Swap confirm state] requestPermitSignature: ', state)
          return state
        })
      },
      permitSigned() {
        setSwapConfirmState((prev) => {
          // Move to `signed` state only if previous state was `requested` - which means the order is using the permit
          // Set to `undefined` otherwise
          const permitSignatureState = prev.permitSignatureState === 'requested' ? 'signed' : undefined

          const state: SwapConfirmState = {
            ...prev,
            permitSignatureState,
          }

          console.debug('[Swap confirm state] permitSigned: ', state)

          return state
        })
      },
      closeSwapConfirm() {
        setSwapConfirmState((prev) => {
          const state = { ...prev, showConfirm: false, permitSignatureState: undefined }
          console.debug('[Swap confirm state] closeSwapConfirm: ', state)
          return state
        })
      },
      sendTransaction(tradeToConfirm: TradeGp) {
        setSwapConfirmState((prev) => {
          const state = {
            ...prev,
            tradeToConfirm,
            attemptingTxn: true,
            swapErrorMessage: undefined,
            showConfirm: true,
            txHash: undefined,
          }
          console.debug('[Swap confirm state] sendTransaction: ', state)
          return state
        })
      },
      transactionSent(txHash: string) {
        setSwapConfirmState((prev) => {
          const state = {
            ...prev,
            attemptingTxn: false,
            swapErrorMessage: undefined,
            showConfirm: !isExpertMode,
            txHash,
            permitSignatureState: undefined,
          }
          console.debug('[Swap confirm state] transactionSent: ', state)
          return state
        })
      },
    }),
    [setSwapConfirmState, isExpertMode]
  )
}
