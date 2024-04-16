import React from 'react'

import { Command } from '@cowprotocol/types'

import { useModalState } from './useModalState'

import { ConfirmationPendingContent } from '../pure/ConfirmationPendingContent'

interface PendingApprovalModalParams {
  currencySymbol?: string
  onDismiss?: Command
  modalMode?: boolean
}

export function usePendingApprovalModal(params?: PendingApprovalModalParams) {
  const { currencySymbol, modalMode, onDismiss } = params || {}

  const state = useModalState<string>()
  const { closeModal, context } = state

  const onDismissCallback = () => {
    closeModal()
    onDismiss?.()
  }

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
}
