import { useCallback, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useModalState } from './useModalState'

import { ConfirmationPendingContent } from '../pure/ConfirmationPendingContent'

interface PendingApprovalModalParams {
  currencySymbol?: string
  onDismiss?: Command
  modalMode?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePendingApprovalModal(params?: PendingApprovalModalParams) {
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
