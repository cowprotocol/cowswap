import { useCallback, useMemo } from 'react'
import { useAppDispatch } from 'state/hooks'

import { useActiveWeb3React } from 'hooks/web3'
import { addTransaction, AddTransactionParams } from '../actions'
import { HashType } from '../reducer'
import { useAllTransactions } from '@src/custom/state/enhancedTransactions/hooks'

export * from './TransactionHooksMod'

type AddTransactionHookParams = Omit<AddTransactionParams, 'chainId' | 'from'> // The hook requires less params for convenience
type TransactionAdder = (params: AddTransactionHookParams) => void

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): TransactionAdder {
  const { chainId, account } = useActiveWeb3React()
  const dispatch = useAppDispatch()

  return useCallback(
    (addTransactionParams: AddTransactionHookParams) => {
      if (!account || !chainId) return

      const { hash, hashType = HashType.ETHEREUM_TX, summary, approval, presign } = addTransactionParams
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({ hash, hashType, from: account, chainId, approval, summary, presign }))
    },
    [dispatch, chainId, account]
  )
}

export function useAllPendingHashes(): string[] {
  const transactions = useAllTransactions()

  return useMemo(() => Object.keys(transactions).filter((hash) => !transactions[hash].receipt), [transactions])
}
