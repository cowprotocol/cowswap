import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { useResetSigningStep } from 'entities/trade'

import { TradeAmounts } from 'common/types'

import {
  setCloseTradeConfirmAtom,
  setErrorTradeConfirmAtom,
  setOpenTradeConfirmAtom,
  setPendingTradeConfirmAtom,
  setPermitSignatureRequestedTradeConfirmAtom,
  setTxHashTradeConfirmAtom,
} from '../state/tradeConfirmStateAtom'

export interface TradeConfirmActions {
  onSign(pendingTrade: TradeAmounts): void
  onError(error: string): void
  onSuccess(transactionHash: string): void
  onOpen(forcePriceConfirmation?: boolean): void
  requestPermitSignature(pendingTrade: TradeAmounts): void
  onDismiss(): void
}

export function useTradeConfirmActions(): TradeConfirmActions {
  const resetSigningStep = useResetSigningStep()
  const setOpenTradeConfirm = useSetAtom(setOpenTradeConfirmAtom)
  const setCloseTradeConfirm = useSetAtom(setCloseTradeConfirmAtom)
  const setErrorTradeConfirm = useSetAtom(setErrorTradeConfirmAtom)
  const setPendingTradeConfirm = useSetAtom(setPendingTradeConfirmAtom)
  const setTxHashTradeConfirm = useSetAtom(setTxHashTradeConfirmAtom)
  const setPermitSignatureRequested = useSetAtom(setPermitSignatureRequestedTradeConfirmAtom)

  return useMemo(() => {
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
      onOpen(forcePriceConfirmation?: boolean) {
        resetSigningStep()
        setOpenTradeConfirm(typeof forcePriceConfirmation === 'boolean' ? forcePriceConfirmation : undefined)
      },
      requestPermitSignature(pendingTrade: TradeAmounts) {
        setPermitSignatureRequested(pendingTrade)
      },
      onDismiss() {
        setCloseTradeConfirm()
      },
    }
  }, [
    resetSigningStep,
    setPendingTradeConfirm,
    setOpenTradeConfirm,
    setCloseTradeConfirm,
    setErrorTradeConfirm,
    setTxHashTradeConfirm,
    setPermitSignatureRequested,
  ])
}
