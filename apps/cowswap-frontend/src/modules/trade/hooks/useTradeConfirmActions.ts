import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useResetSigningStep } from 'entities/trade'

import { TradeAmounts } from 'common/types'

import {
  setCloseTradeConfirmAtom,
  setConfirmingTradeConfirmAtom,
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
  requestPermitSignature(pendingTrade: TradeAmounts, permitAmount?: CurrencyAmount<Currency>): void
  onDismiss(): void
  /**
   * Marks the confirm flow as in progress (from the moment the confirm button is clicked) or
   * aborted (reset back to false). While `true`, the confirm modal freezes its displayed amounts.
   */
  setConfirming(isConfirming: boolean): void
}

export function useTradeConfirmActions(): TradeConfirmActions {
  const resetSigningStep = useResetSigningStep()
  const setOpenTradeConfirm = useSetAtom(setOpenTradeConfirmAtom)
  const setCloseTradeConfirm = useSetAtom(setCloseTradeConfirmAtom)
  const setErrorTradeConfirm = useSetAtom(setErrorTradeConfirmAtom)
  const setPendingTradeConfirm = useSetAtom(setPendingTradeConfirmAtom)
  const setTxHashTradeConfirm = useSetAtom(setTxHashTradeConfirmAtom)
  const setPermitSignatureRequested = useSetAtom(setPermitSignatureRequestedTradeConfirmAtom)
  const setConfirmingAtom = useSetAtom(setConfirmingTradeConfirmAtom)

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
      requestPermitSignature(pendingTrade: TradeAmounts, permitAmount?: CurrencyAmount<Currency>) {
        setPermitSignatureRequested(pendingTrade, permitAmount)
      },
      onDismiss() {
        setCloseTradeConfirm()
      },
      setConfirming(isConfirming: boolean) {
        setConfirmingAtom(isConfirming)
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
    setConfirmingAtom,
  ])
}
