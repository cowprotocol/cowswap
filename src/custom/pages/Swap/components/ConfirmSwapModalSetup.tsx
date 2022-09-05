import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { useCallback } from 'react'
import TradeGp from 'state/swap/TradeGp'
import { Percent } from '@uniswap/sdk-core'
import { Field } from 'state/swap/actions'
import { useAtomValue } from 'jotai/utils'
import { swapConfirmAtom } from 'pages/Swap/state/swapConfirmAtom'
import { HandleSwapCallback } from 'pages/Swap/hooks/useHandleSwap'
import { useSwapConfirmManager } from 'pages/Swap/hooks/useSwapConfirmManager'
import TransactionConfirmationModal, { OperationType } from 'components/TransactionConfirmationModal'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { useModalIsOpen } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useCloseModals } from 'state/application/hooks'

export interface ConfirmSwapModalSetupProps {
  trade: TradeGp | undefined
  recipient: string | null
  allowedSlippage: Percent
  handleSwap: HandleSwapCallback
  operationType: OperationType
  priceImpact?: Percent
  swapConfirmMessage: string // TODO: move to atom
  dismissNativeWrapModal(): void
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const {
    trade,
    recipient,
    allowedSlippage,
    priceImpact,
    handleSwap,
    operationType,
    swapConfirmMessage,
    dismissNativeWrapModal,
  } = props

  const swapConfirmState = useAtomValue(swapConfirmAtom)
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
        pendingText={swapConfirmMessage}
        onDismiss={onDismiss}
        operationType={operationType}
      />
    </>
  )
}
