import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { useCallback } from 'react'
import TradeGp from 'state/swap/TradeGp'
import { Percent } from '@uniswap/sdk-core'
import { Field } from 'state/swap/actions'
import { useAtomValue } from 'jotai/utils'
import { swapConfirmAtom } from '@cow/modules/swap/state/swapConfirmAtom'
import { useSwapConfirmManager } from '@cow/modules/swap/hooks/useSwapConfirmManager'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { useModalIsOpen } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useCloseModals } from 'state/application/hooks'
import { transactionConfirmAtom } from '@cow/modules/swap/state/transactionConfirmAtom'
import { HandleSwapCallback } from '@cow/modules/swap/pure/SwapButtons'
import { RateInfoParams } from '@cow/common/pure/RateInfo'

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
