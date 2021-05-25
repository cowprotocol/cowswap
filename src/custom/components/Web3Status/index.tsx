import React, { useMemo } from 'react'
import { AbstractConnector } from '@web3-react/abstract-connector'

import WalletModal from 'components/WalletModal'
import { getStatusIcon } from 'components/AccountDetails'

import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { useWalletInfo } from 'hooks/useWalletInfo'

import { OrderStatus } from 'state/orders/actions'

import { Web3StatusInner } from './Web3StatusMod'

const isPending = (data: TransactionAndOrder) => data.status === OrderStatus.PENDING
const isConfirmedOrExpired = (data: TransactionAndOrder) =>
  data.status === OrderStatus.FULFILLED || data.status === OrderStatus.EXPIRED

function StatusIcon({ connector }: { connector: AbstractConnector }): JSX.Element | null {
  const walletInfo = useWalletInfo()
  return getStatusIcon(connector, walletInfo)
}

export default function Web3Status() {
  const walletInfo = useWalletInfo()
  console.log('[Web3Status] Wallet info', walletInfo)

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

  const { active, activeNetwork, ensName } = walletInfo
  if (!activeNetwork && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner pendingCount={pendingActivity.length} StatusIconComponent={StatusIcon} />
      <WalletModal
        ENSName={ensName}
        pendingTransactions={pendingActivity}
        confirmedTransactions={confirmedAndExpiredActivity}
      />
    </>
  )
}
