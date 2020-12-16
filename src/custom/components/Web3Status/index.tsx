import React from 'react'
import { useWeb3React } from '@web3-react/core'
import useENSName from 'hooks/useENSName'
import { NetworkContextName } from 'constants/index'

import WalletModal from 'components/WalletModal'
import { Web3StatusInner } from './Web3StatusMod'
import useRecentActivity from 'hooks/useRecentActivity'

export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const { pendingActivity, confirmedActivity } = useRecentActivity()

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner pendingCount={pendingActivity.length + confirmedActivity.length} />
      <WalletModal
        ENSName={ENSName ?? undefined}
        pendingTransactions={pendingActivity}
        confirmedTransactions={confirmedActivity}
      />
    </>
  )
}
