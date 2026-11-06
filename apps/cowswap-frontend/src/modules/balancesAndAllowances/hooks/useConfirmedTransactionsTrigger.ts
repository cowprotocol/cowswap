import { useEffect, useRef, useState } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'

import ms from 'ms.macro'

import { useAllTransactionHashes } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

const DEBOUNCE_FOR_CONFIRMED_TRANSACTIONS_MS = ms`1s`

const isConfirmed = (transaction: EnhancedTransactionDetails): boolean => !!transaction.receipt

/**
 * Invalidate cache trigger that updates once a tracked transaction confirms, so balances and
 * allowances are re-read instead of waiting out the poll interval. A Solana order carries its SPL
 * delegation in the same transaction that creates it, so the snapshot taken before placement reads
 * zero until something forces a refetch.
 */
export function useConfirmedTransactionsTrigger(): number {
  const confirmedCount = useAllTransactionHashes(isConfirmed).length
  const [triggerValue, setTriggerValue] = useState(0)
  const previousCountRef = useRef(confirmedCount)

  useEffect(() => {
    if (previousCountRef.current === confirmedCount) return

    previousCountRef.current = confirmedCount
    setTriggerValue((prev) => prev + 1)
  }, [confirmedCount])

  return useDebounce(triggerValue, DEBOUNCE_FOR_CONFIRMED_TRANSACTIONS_MS)
}
