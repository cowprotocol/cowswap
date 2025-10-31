import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useZeroApprovalState } from '../../hooks/useZeroApprovalState'

interface ZeroApprovalModalProps {
  onDismiss(): void
}

export function ZeroApprovalModal({ onDismiss }: ZeroApprovalModalProps): ReactNode {
  const { currency } = useZeroApprovalState()
  const symbol = currency?.symbol?.toUpperCase() ?? t`Unknown Currency` // This should never happen.

  return (
    <ConfirmationPendingContent
      onDismiss={onDismiss}
      title={
        <Trans>
          Reset <strong>{symbol}</strong> allowance
        </Trans>
      }
      description={t`Reset ${symbol} allowance to 0 before setting new spending cap`}
      operationLabel={t`token approval`}
    />
  )
}
