import { useCallback } from 'react'

import { useBlockNumber } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

export function useShouldCheckPendingTx() {
  const { account } = useWalletInfo()

  const lastBlockNumber = useBlockNumber()
  const accountLowerCase = account?.toLowerCase() || ''

  return useCallback(
    (tx: EnhancedTransactionDetails) => shouldCheckPendingTx(lastBlockNumber, accountLowerCase, tx),
    [accountLowerCase, lastBlockNumber]
  )
}

function shouldCheckPendingTx(
  lastBlockNumber: number | undefined,
  accountLowerCase: string,
  tx: EnhancedTransactionDetails
): boolean {
  const isCurrentAccount = tx.from.toLowerCase() === accountLowerCase
  const isReplaced = !!(tx.replacementType || tx.linkedTransactionHash)
  const isTxMined = !!tx.receipt
  const isFailed = !!tx.errorMessage

  if (!isCurrentAccount || isReplaced || isTxMined || isFailed) return false

  // If a tx was never checked, we should check it
  if (!tx.lastCheckedBlockNumber) return true

  if (!lastBlockNumber) return false

  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false

  const minutesPending = (Date.now() - tx.addedTime) / 1000 / 60
  // every 3 blocks if pending for longer than 5 minutes
  if (minutesPending > 5) return blocksSinceCheck >= 3

  // every 2 blocks if pending more than 1 minute
  if (minutesPending > 1) return blocksSinceCheck >= 2

  // otherwise every block
  return true
}
