import { ReactElement } from 'react'

import { TextAlert } from '../styled'

interface GnosisSafeSignatureMessageProps {
  isExecutedActivity: boolean
  isCancelled: boolean
  isExpired: boolean
  isFailed: boolean
  alreadySigned: boolean
  numConfirmations: number
  gnosisSafeThreshold: number
  isExecuted: boolean
  isPendingSignatures: boolean
  pendingSignaturesCount: number
  isReplaced: boolean
}

export function GnosisSafeSignatureMessage({
  isExecutedActivity,
  isCancelled,
  isExpired,
  isFailed,
  alreadySigned,
  numConfirmations,
  gnosisSafeThreshold,
  isExecuted,
  isPendingSignatures,
  pendingSignaturesCount,
  isReplaced,
}: GnosisSafeSignatureMessageProps): ReactElement {
  const areIsMessage = pendingSignaturesCount > 1 ? 's are' : ' is'

  if (isExecutedActivity) {
    return <span>Executed</span>
  }

  if (isCancelled) {
    return <span>Cancelled order</span>
  }

  if (isExpired) {
    return <span>Expired order</span>
  }

  if (isFailed) {
    return <span>Invalid order</span>
  }

  if (alreadySigned) {
    return <span>Enough signatures</span>
  }

  if (numConfirmations === 0) {
    return (
      <>
        <span>
          <b>No signatures yet</b>
        </span>
        <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
          {gnosisSafeThreshold} signature{areIsMessage} required
        </TextAlert>
      </>
    )
  }

  if (numConfirmations >= gnosisSafeThreshold) {
    return isExecuted ? (
      <span>
        <b>Enough signatures</b>
      </span>
    ) : (
      <>
        {!isReplaced && (
          <>
            <span>
              Enough signatures, <b>but not executed</b>
            </span>
            <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
              Execute Safe transaction
            </TextAlert>
          </>
        )}
      </>
    )
  }

  return (
    <>
      <span>
        Signed:{' '}
        <b>
          {numConfirmations} out of {gnosisSafeThreshold} signers
        </b>
      </span>
      <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
        {pendingSignaturesCount} more signature{areIsMessage} required
      </TextAlert>
    </>
  )
}