import React, { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import useENSName from 'hooks/useENSName'
import { NetworkContextName } from 'constants/index'

import WalletModal from 'components/WalletModal'
import { Web3StatusInner } from './Web3StatusMod'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { OrderStatus } from 'state/orders/actions'

const isPending = (data: TransactionAndOrder) => data.status === OrderStatus.PENDING
const isConfirmedOrExpired = (data: TransactionAndOrder) =>
  data.status === OrderStatus.FULFILLED || data.status === OrderStatus.EXPIRED

export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const allRecentActivity = useRecentActivity()

  const { pendingActivity, confirmedAndExpiredActivity } = useMemo(() => {
    // Separate the array into 2: PENDING and FULFILLED(or CONFIRMED)+EXPIRED
    const pendingActivity = allRecentActivity.filter(isPending).map(data => data.id)
    const confirmedAndExpiredActivity = allRecentActivity.filter(isConfirmedOrExpired).map(data => data.id)

    return {
      pendingActivity,
      confirmedAndExpiredActivity
    }
  }, [allRecentActivity])

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner pendingCount={pendingActivity.length} />
      <WalletModal
        ENSName={ENSName ?? undefined}
        pendingTransactions={pendingActivity}
        confirmedTransactions={confirmedAndExpiredActivity}
      />
    </>
  )
}
