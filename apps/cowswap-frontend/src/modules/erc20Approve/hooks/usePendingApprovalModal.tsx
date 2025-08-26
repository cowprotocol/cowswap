import { ReactNode, useCallback, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { ModalState, useModalState } from 'common/hooks/useModalState'
import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

interface PendingApprovalModalParams {
  currencySymbol?: string
  onDismiss?: Command
  modalMode?: boolean
}

export function usePendingApprovalModal(params?: PendingApprovalModalParams): {
  Modal: ReactNode
  state: ModalState<string>
} {
  const { currencySymbol, modalMode, onDismiss } = params || {}

  const state = useModalState<string>()
  const { closeModal, context } = state

  const onDismissCallback = useCallback(() => {
    closeModal()
    onDismiss?.()
  }, [closeModal, onDismiss])

  return useMemo(() => {
    const Title = (
      <>
        Approving <strong>{currencySymbol || context}</strong> for trading
      </>
    )

    const Modal = (
      <ConfirmationPendingContent
        modalMode={!!modalMode}
        onDismiss={onDismissCallback}
        title={Title}
        description="Approving token"
        operationLabel="token approval"
      />
    )

    return { Modal, state }
  }, [currencySymbol, context, modalMode, onDismissCallback, state])
}
