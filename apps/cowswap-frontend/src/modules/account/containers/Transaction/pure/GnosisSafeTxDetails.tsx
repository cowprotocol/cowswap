import { ReactElement } from 'react'

import { SafeWalletLink } from 'common/pure/SafeWalletLink'
import { TransactionInnerDetail } from 'common/pure/TransactionInnerDetail'
import { ActivityDerivedState, ActivityStatus } from 'common/types/activity'

import { GnosisSafeSignatureMessage } from './GnosisSafeSignatureMessage'

interface GnosisSafeTxDetailsProps {
  chainId: number
  activityDerivedState: ActivityDerivedState
}

export function GnosisSafeTxDetails({ chainId, activityDerivedState }: GnosisSafeTxDetailsProps): ReactElement | null {
  const { gnosisSafeInfo, enhancedTransaction, status, isOrder, order, isExpired, isCancelled, isFailed } =
    activityDerivedState
  const gnosisSafeThreshold = gnosisSafeInfo?.threshold
  const safeTransaction = enhancedTransaction?.safeTransaction || order?.presignGnosisSafeTx
  const isReplaced = enhancedTransaction?.replacementType === 'replaced'

  if (!gnosisSafeThreshold || !gnosisSafeInfo || !safeTransaction) {
    return null
  }

  // The activity is executed Is tx mined or is the swap executed
  const isExecutedActivity = isOrder
    ? order?.fulfillmentTime !== undefined
    : enhancedTransaction?.confirmedTime !== undefined

  // Check if it's in a state where we don't need more signatures. We do this, because this state comes from CoW Swap API, which
  // sometimes can be faster getting the state than Gnosis Safe API (that would give us the pending signatures). We use
  // this check to infer that we don't need to sign anything anymore
  const alreadySigned = isOrder ? status !== ActivityStatus.PRESIGNATURE_PENDING : status !== ActivityStatus.PENDING

  const { confirmations, nonce, isExecuted } = safeTransaction

  const numConfirmations = confirmations?.length ?? 0
  const pendingSignaturesCount = gnosisSafeThreshold - numConfirmations
  const isPendingSignatures = pendingSignaturesCount > 0

  return (
    <TransactionInnerDetail>
      <span>
        Safe Nonce: <b>{nonce}</b>
      </span>
      <GnosisSafeSignatureMessage
        isExecutedActivity={isExecutedActivity}
        isCancelled={isCancelled}
        isExpired={isExpired}
        isFailed={isFailed}
        alreadySigned={alreadySigned}
        numConfirmations={numConfirmations}
        gnosisSafeThreshold={gnosisSafeThreshold}
        isExecuted={isExecuted}
        isPendingSignatures={isPendingSignatures}
        pendingSignaturesCount={pendingSignaturesCount}
        isReplaced={isReplaced}
      />

      {/* View in: Gnosis Safe */}
      <SafeWalletLink chainId={chainId} safeTransaction={safeTransaction} asButton />
    </TransactionInnerDetail>
  )
}