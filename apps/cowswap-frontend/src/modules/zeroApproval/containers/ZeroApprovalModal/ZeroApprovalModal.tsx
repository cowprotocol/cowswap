import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useZeroApprovalState } from '../../hooks/useZeroApprovalState'

interface ZeroApprovalModalProps {
  onDismiss(): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
