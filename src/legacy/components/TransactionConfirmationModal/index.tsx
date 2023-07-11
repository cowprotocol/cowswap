import React, { ReactNode, useCallback, useEffect } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { getActivityState, useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { handleFollowPendingTxPopupAtom, useUpdateAtom } from 'legacy/state/application/atoms'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { setIsConfirmationModalOpenAtom } from 'modules/swap/state/surplusModal'
import { useWalletInfo } from 'modules/wallet'

import { CowModal } from 'common/pure/Modal'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { LegacyConfirmationPendingContent } from './LegacyConfirmationPendingContent'
import { ConfirmOperationType } from './types'

export * from './types'

export interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash?: string | undefined
  content?: () => ReactNode
  attemptingTxn: boolean
  pendingText?: ReactNode
  currencyToAdd?: Currency | undefined
  operationType: ConfirmOperationType
}

export function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
  operationType,
}: ConfirmationModalProps) {
  const { chainId } = useWalletInfo()
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const activities = useMultipleActivityDescriptors({ chainId, ids: [hash || ''] }) || []
  const activityDerivedState = useActivityDerivedState({ chainId, activity: activities[0] })

  const setIsConfirmationModalOpen = useUpdateAtom(setIsConfirmationModalOpenAtom)

  useEffect(() => setIsConfirmationModalOpen(isOpen && !!hash), [hash, isOpen, setIsConfirmationModalOpen])

  const _onDismiss = useCallback(() => {
    setIsConfirmationModalOpen(false)

    const onDismissFn =
      !attemptingTxn && hash
        ? () => {
            setShowFollowPendingTxPopup(true)
            onDismiss()
          }
        : onDismiss

    onDismissFn()
  }, [attemptingTxn, hash, onDismiss, setIsConfirmationModalOpen, setShowFollowPendingTxPopup])

  if (!chainId) return null

  const width = getWidth(hash, activityDerivedState)

  return (
    <CowModal isOpen={isOpen} onDismiss={_onDismiss} maxHeight={90} maxWidth={width}>
      {attemptingTxn ? (
        <LegacyConfirmationPendingContent
          chainId={chainId}
          operationType={operationType}
          onDismiss={onDismiss}
          pendingText={pendingText}
        />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          activityDerivedState={activityDerivedState}
          onDismiss={_onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content?.()
      )}
    </CowModal>
  )
}

function getWidth(hash: string | undefined, activityDerivedState: ActivityDerivedState | null): number {
  if (activityDerivedState && getActivityState(activityDerivedState) === 'filled') {
    return 470
  }
  if (hash) {
    return 850
  }
  return 470
}
