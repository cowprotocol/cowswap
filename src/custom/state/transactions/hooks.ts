import { useMemo } from 'react'
import { useAllClaimingTransactions } from 'state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'

export * from '@src/state/transactions/hooks'

// watch for submissions to claim
// return null if not done loading, return undefined if not found
export function useUserHasSubmittedClaim(account?: string): {
  claimSubmitted: boolean
  claimTxn: EnhancedTransactionDetails | undefined
} {
  const pendingClaims = useAllClaimingTransactions()
  const claimTxn = useMemo(
    () =>
      // find one that is both the user's claim, AND not mined
      pendingClaims.find((claim) => claim.claim?.recipient === account),
    [account, pendingClaims]
  )

  return { claimSubmitted: !!claimTxn, claimTxn }
}
