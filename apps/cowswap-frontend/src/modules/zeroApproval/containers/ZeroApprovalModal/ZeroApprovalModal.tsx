import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useZeroApprovalState } from '../../hooks/useZeroApprovalState'

interface ZeroApprovalModalProps {
  onDismiss(): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ZeroApprovalModal({ onDismiss }: ZeroApprovalModalProps) {
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
