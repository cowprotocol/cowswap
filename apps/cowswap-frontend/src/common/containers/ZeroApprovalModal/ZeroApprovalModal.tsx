import { useEffect } from 'react'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { useZeroApprovalState } from 'common/state/useZeroApprovalState'

import { ModalState } from '../../hooks/useModalState'

interface ZeroApprovalModalProps {
  modalState: ModalState<void>
}

export function ZeroApprovalModal({ modalState }: ZeroApprovalModalProps) {
  const { isApproving, currency } = useZeroApprovalState()
  const { isModalOpen, openModal, closeModal } = modalState

  const symbol = currency?.symbol?.toUpperCase() ?? 'Unknown Currency' // This should never happen.

  useEffect(() => {
    if (isApproving) {
      openModal()
    } else {
      closeModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproving])

  if (!isModalOpen) return null

  return (
    <ConfirmationPendingContent
      onDismiss={closeModal}
      title={
        <>
          Reset <strong>{symbol}</strong> allowance
        </>
      }
      description={`Reset ${symbol} allowance to 0 before setting new spending cap`}
      operationLabel="token approval"
    />
  )
}
