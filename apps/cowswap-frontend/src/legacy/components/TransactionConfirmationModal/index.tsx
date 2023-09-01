import { useSetAtom } from 'jotai'
import React, { ReactNode, useCallback, useEffect } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { getActivityState, useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { handleFollowPendingTxPopupAtom } from 'legacy/state/application/atoms'

import { useSetIsConfirmationModalOpen } from 'modules/swap/state/surplusModal'
import { useWalletInfo } from 'modules/wallet'

import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
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
  const setShowFollowPendingTxPopup = useSetAtom(handleFollowPendingTxPopupAtom)
  const activities = useMultipleActivityDescriptors({ chainId, ids: [hash || ''] }) || []
  const activityDerivedState = useActivityDerivedState({ chainId, activity: activities[0] })
  const { showSurplus: canShowSurplus } = useGetSurplusData(activityDerivedState?.order)

  const showSurplus = canShowSurplus && activityDerivedState && getActivityState(activityDerivedState) === 'filled'

  const setIsConfirmationModalOpen = useSetIsConfirmationModalOpen()

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

  const width = getWidth(hash, showSurplus)

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
          showSurplus={showSurplus}
        />
      ) : (
        content?.()
      )}
    </CowModal>
  )
}

function getWidth(hash: string | undefined, showSurplus: boolean | null): number {
  if (showSurplus) {
    return 470
  }
  if (hash) {
    return 850
  }
  return 470
}
