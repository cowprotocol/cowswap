import { useCallback } from 'react'

import { useBlockNumber } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

export function useShouldCheckPendingTx() {
  const { account } = useWalletInfo()

  const lastBlockNumber = useBlockNumber()
  const accountLowerCase = account?.toLowerCase() || ''

  return useCallback(
    (tx: EnhancedTransactionDetails) => {
      if (!lastBlockNumber) return false

      return (
        tx.from.toLowerCase() === accountLowerCase && !tx.replacementType && shouldCheckPendingTx(lastBlockNumber, tx)
      )
    },
    [accountLowerCase, lastBlockNumber]
  )
}

function shouldCheckPendingTx(lastBlockNumber: number, tx: EnhancedTransactionDetails): boolean {
  if (tx.receipt || !tx.lastCheckedBlockNumber) return false

  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false

  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  // every 10 blocks if pending for longer than an hour
  if (minutesPending > 60) return blocksSinceCheck > 9

  // every 3 blocks if pending more than 5 minutes
  if (minutesPending > 5) return blocksSinceCheck >= 3

  // otherwise every block
  return true
}
