import React, { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import useENSName from 'hooks/useENSName'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { NetworkContextName } from 'constants/index'

import WalletModal from '@src/components/WalletModal'
import { Web3StatusInner, newTransactionsFirst } from './Web3StatusMod'

export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  // ---------- TODO: get tx and meta-tx
  const allTransactions = useAllTransactions()
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])
  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)
  // ----------------------------

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner pendingCount={pending.length} />
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
}
