import React, { ReactNode } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { getActivityState, useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { handleFollowPendingTxPopupAtom, useUpdateAtom } from 'legacy/state/application/atoms'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { useWalletInfo } from 'modules/wallet'

import { GpModal } from 'common/pure/Modal'
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
  pendingText: ReactNode
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

  if (!chainId) return null

  const width = getWidth(hash, activityDerivedState)

  const _onDismiss =
    !attemptingTxn && hash
      ? () => {
          setShowFollowPendingTxPopup(true)
          onDismiss()
        }
      : onDismiss

  return (
    <GpModal isOpen={isOpen} onDismiss={_onDismiss} maxHeight={90} maxWidth={width}>
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
    </GpModal>
  )
}

function getWidth(hash: string | undefined, activityDerivedState: ActivityDerivedState | null): number {
  if (activityDerivedState && getActivityState(activityDerivedState) === 'filled') {
    return 400
  }
  if (hash) {
    return 850
  }
  return 470
}
