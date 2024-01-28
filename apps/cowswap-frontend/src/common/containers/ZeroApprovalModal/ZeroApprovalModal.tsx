import { useCallback, useEffect, useState } from 'react'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { CowModal } from 'common/pure/Modal'
import { useZeroApprovalState } from 'common/state/useZeroApprovalState'

interface ZeroApprovalModalProps {
  onDismiss?: () => void
}

export function ZeroApprovalModal({ onDismiss = () => {} }: ZeroApprovalModalProps) {
  const { isApproving, currency } = useZeroApprovalState()
  const [hasUserClosedModal, setHasUserClosedModal] = useState(false)

  const shouldShow = isApproving && !hasUserClosedModal

  const handleDismiss = useCallback(() => {
    setHasUserClosedModal(true)
    onDismiss()
  }, [onDismiss])

  useEffect(() => {
    if (!isApproving && hasUserClosedModal) {
      setHasUserClosedModal(false)
    }
  }, [isApproving, hasUserClosedModal])

  const symbol = currency?.symbol?.toUpperCase() ?? 'Unknown Currency' // This should never happen.

  return (
    <CowModal isOpen={shouldShow} onDismiss={handleDismiss}>
      <ConfirmationPendingContent
        onDismiss={handleDismiss}
        title={
          <>
            Reset <strong>{symbol}</strong> allowance
          </>
        }
        description={`Reset ${symbol} allowance to 0 before setting new spending cap`}
        operationLabel="token approval"
      />
    </CowModal>
  )
}
