import { ReactNode, useCallback, useMemo } from 'react'

import { Command } from '@cowprotocol/types'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ModalState, useModalState } from 'common/hooks/useModalState'
import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { isMaxAmountToApprove } from '../utils'

interface PendingApprovalModalParams {
  currencySymbol?: string
  onDismiss?: Command
  modalMode?: boolean
  isPendingInProgress?: boolean
  amountToApprove?: CurrencyAmount<Currency>
}

export function usePendingApprovalModal(params?: PendingApprovalModalParams): {
  Modal: ReactNode
  state: ModalState<string>
} {
  const { currencySymbol, modalMode, onDismiss, isPendingInProgress, amountToApprove } = params || {}

  const state = useModalState<string>()
  const { closeModal, context } = state

  const onDismissCallback = useCallback(() => {
    closeModal()
    onDismiss?.()
  }, [closeModal, onDismiss])

  return useMemo(() => {
    const Title =
      amountToApprove && !isMaxAmountToApprove(amountToApprove) ? (
        <>
          Approving <TokenAmount amount={amountToApprove} />{' '}
          <strong>
            <TokenSymbol token={amountToApprove.currency} />
          </strong>{' '}
          for trading
        </>
      ) : (
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
        isPendingInProgress={isPendingInProgress}
      />
    )

    return { Modal, state }
  }, [amountToApprove, currencySymbol, context, modalMode, onDismissCallback, isPendingInProgress, state])
}
