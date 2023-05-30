import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'

import { Percent } from '@uniswap/sdk-core'

import { ConfirmSwapModal } from 'legacy/components/swap/ConfirmSwapModal'
import TransactionConfirmationModal from 'legacy/components/TransactionConfirmationModal'
import { useCloseModals } from 'legacy/state/application/hooks'
import { useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { Field } from 'legacy/state/swap/actions'
import { useSwapActionHandlers } from 'legacy/state/swap/hooks'
import TradeGp from 'legacy/state/swap/TradeGp'

import { useSwapConfirmManager } from 'modules/swap/hooks/useSwapConfirmManager'
import { HandleSwapCallback } from 'modules/swap/pure/SwapButtons'
import { swapConfirmAtom } from 'modules/swap/state/swapConfirmAtom'
import { transactionConfirmAtom } from 'modules/swap/state/transactionConfirmAtom'

import { RateInfoParams } from 'common/pure/RateInfo'

export interface ConfirmSwapModalSetupProps {
  trade: TradeGp | undefined
  recipient: string | null
  allowedSlippage: Percent
  handleSwap: HandleSwapCallback
  priceImpact?: Percent
  rateInfoParams: RateInfoParams
  dismissNativeWrapModal(): void
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const { trade, recipient, allowedSlippage, priceImpact, handleSwap, dismissNativeWrapModal, rateInfoParams } = props

  const swapConfirmState = useAtomValue(swapConfirmAtom)
  const { operationType, pendingText } = useAtomValue(transactionConfirmAtom)
  const { acceptRateUpdates, closeSwapConfirm } = useSwapConfirmManager()
  const { onUserInput } = useSwapActionHandlers()
  const closeModals = useCloseModals()
  const showTransactionConfirmationModal = useModalIsOpen(ApplicationModal.TRANSACTION_CONFIRMATION)

  const onDismiss = useCallback(() => {
    closeModals()
    dismissNativeWrapModal()
  }, [closeModals, dismissNativeWrapModal])

  const handleAcceptChanges = useCallback(() => {
    trade && acceptRateUpdates(trade)
  }, [acceptRateUpdates, trade])

  const handleConfirmDismiss = useCallback(() => {
    closeSwapConfirm()
    // if there was a tx hash, we want to clear the input
    if (swapConfirmState.txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [closeSwapConfirm, onUserInput, swapConfirmState.txHash])

  return (
    <>
      <ConfirmSwapModal
        rateInfoParams={rateInfoParams}
        swapConfirmState={swapConfirmState}
        trade={trade}
        onAcceptChanges={handleAcceptChanges}
        recipient={recipient}
        allowedSlippage={allowedSlippage}
        priceImpact={priceImpact}
        onConfirm={handleSwap}
        onDismiss={handleConfirmDismiss}
      />

      <TransactionConfirmationModal
        attemptingTxn={true}
        isOpen={showTransactionConfirmationModal}
        pendingText={pendingText}
        onDismiss={onDismiss}
        operationType={operationType}
      />
    </>
  )
}
