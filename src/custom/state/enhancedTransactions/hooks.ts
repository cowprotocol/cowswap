import { useMemo } from 'react'
import { useAllTransactions } from 'state/transactions/hooks'

export function useAllPendingHashes(): string[] {
  const transactions = useAllTransactions()

  return useMemo(() => Object.keys(transactions).filter((hash) => !transactions[hash].receipt), [transactions])
}
