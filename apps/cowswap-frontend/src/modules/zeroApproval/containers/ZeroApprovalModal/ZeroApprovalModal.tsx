import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useZeroApprovalState } from '../../hooks/useZeroApprovalState'

interface ZeroApprovalModalProps {
  onDismiss(): void
}

export function ZeroApprovalModal({ onDismiss }: ZeroApprovalModalProps) {
  const { currency } = useZeroApprovalState()

  const symbol = currency?.symbol?.toUpperCase() ?? 'Unknown Currency' // This should never happen.

  return (
    <ConfirmationPendingContent
      onDismiss={onDismiss}
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
