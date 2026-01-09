import { ReactNode, useCallback, useMemo } from 'react'

import { Command } from '@cowprotocol/types'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'

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

  const showPendingState = Boolean(isPendingInProgress)

  const onDismissCallback = useCallback(() => {
    closeModal()
    onDismiss?.()
  }, [closeModal, onDismiss])

  const { t } = useLingui()

  return useMemo(() => {
    const currencySymbolOrContext = currencySymbol || context
    const Title =
      amountToApprove && !isMaxAmountToApprove(amountToApprove) ? (
        <Trans>
          Approving <TokenAmount amount={amountToApprove} />{' '}
          <strong>
            <TokenSymbol token={amountToApprove.currency} />
          </strong>{' '}
          for trading
        </Trans>
      ) : (
        <Trans>
          Approving <strong>{currencySymbolOrContext}</strong> for trading
        </Trans>
      )

    const Modal = (
      <ConfirmationPendingContent
        modalMode={!!modalMode}
        onDismiss={onDismissCallback}
        title={Title}
        description={t`Approving token`}
        operationLabel={t`token approval`}
        isPendingInProgress={showPendingState}
      />
    )

    return { Modal, state }
  }, [amountToApprove, currencySymbol, context, modalMode, onDismissCallback, showPendingState, state, t])
}
