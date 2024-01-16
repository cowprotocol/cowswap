import { useCallback, useEffect, useState } from 'react'

import { useWalletDetails, useWalletDisplayedAddress } from '@cowprotocol/wallet'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { CowModal } from 'common/pure/Modal'
import { useZeroApprovalState } from 'common/state/useZeroApprovalState'

import { useWalletStatusIcon } from '../../hooks/useWalletStatusIcon'

interface ZeroApprovalModalProps {
  onDismiss?: () => void
}

export function ZeroApprovalModal({ onDismiss = () => {} }: ZeroApprovalModalProps) {
  const walletDetails = useWalletDetails()
  const walletAddress = useWalletDisplayedAddress()
  const { isApproving, currency } = useZeroApprovalState()
  const statusIcon = useWalletStatusIcon()
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

  const { walletName } = walletDetails
  const symbol = currency?.symbol?.toUpperCase() ?? 'Unknown Currency' // This should never happen.

  return (
    <CowModal isOpen={shouldShow} onDismiss={handleDismiss}>
      <ConfirmationPendingContent
        onDismiss={handleDismiss}
        statusIcon={statusIcon}
        title={
          <>
            Reset <strong>{symbol}</strong> allowance
          </>
        }
        description={`Reset ${symbol} allowance to 0 before setting new spending cap`}
        operationSubmittedMessage="The token approval is submitted."
        walletNameLabel={walletName}
        walletAddress={walletAddress}
        operationLabel="token approval"
      />
    </CowModal>
  )
}
