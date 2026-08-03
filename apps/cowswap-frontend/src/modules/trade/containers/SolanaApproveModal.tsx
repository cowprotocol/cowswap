import { ReactNode, useCallback } from 'react'

import { t } from '@lingui/core/macro'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useSolanaApproveScreenState } from '../hooks/useSolanaApproveScreenState'

/**
 * Pending screen for the Solana SPL approve, mirroring {@link WrapNativeModal}: the shared
 * `ConfirmationPendingContent` while the wallet signs. Errors are shown by `TradeWidgetModals` via the
 * shared `TransactionErrorContent`, driven by `solanaApproveStateAtom.errorMessage`.
 */
export function SolanaApproveModal(): ReactNode {
  const [{ tokenSymbol }, setSolanaApproveState] = useSolanaApproveScreenState()

  const handleDismiss = useCallback(() => {
    setSolanaApproveState({ isOpen: false })
  }, [setSolanaApproveState])

  const operationLabel = t`Approving`
  const title = tokenSymbol ? `${operationLabel} ${tokenSymbol}` : operationLabel

  return (
    <ConfirmationPendingContent
      onDismiss={handleDismiss}
      title={<span>{title}</span>}
      description={title}
      operationLabel={operationLabel.toLowerCase()}
    />
  )
}
