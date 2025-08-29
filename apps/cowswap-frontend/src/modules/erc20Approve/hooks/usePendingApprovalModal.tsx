import { ReactNode, useCallback, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

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
        <Trans>Approving</Trans> <strong>{currencySymbol || context}</strong> <Trans>for trading</Trans>
      </>
    )

    const Modal = (
      <ConfirmationPendingContent
        modalMode={!!modalMode}
        onDismiss={onDismissCallback}
        title={Title}
        description={t`Approving token`}
        operationLabel={t`token approval`}
      />
    )

    return { Modal, state }
  }, [currencySymbol, context, modalMode, onDismissCallback, state])
}
