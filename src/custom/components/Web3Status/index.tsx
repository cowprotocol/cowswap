import { useMemo } from 'react'
import styled from 'styled-components/macro'
import WalletModal from 'components/WalletModal'
import { Web3StatusInner, Web3StatusConnected, Text } from './Web3StatusMod'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { OrderStatus } from 'state/orders/actions'
import { STORAGE_KEY_LAST_PROVIDER } from 'constants/index'

export const Wrapper = styled.div`
  color: ${({ theme }) => theme.wallet?.color};
  height: 40px;
  width: 100%;
  display: flex;
  padding: 0;
  margin: 0;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: auto;
    height: 100%;
    margin: 0 0 0 auto;
  `};

  button {
    height: auto;
    border-radius: 21px;
    padding: 6px 12px;
    width: max-content;
  }

  ${Web3StatusConnected} {
    border-radius: 21px;
    color: ${({ theme }) => theme.wallet?.color};
    background: ${({ theme }) => theme.wallet?.background};
    height: 100%;
    width: 100%;
    border: 0;
    box-shadow: none;
    padding: 6px 8px;
    transform: none;

    &:hover {
      border: 0;
    }

    > div > svg > path {
      stroke: ${({ theme }) => theme.black};
    }
  }

  ${Text} {
  }
`

export const isPending = (data: TransactionAndOrder) =>
  data.status === OrderStatus.PENDING || data.status === OrderStatus.PRESIGNATURE_PENDING

const isConfirmed = (data: TransactionAndOrder) =>
  data.status === OrderStatus.FULFILLED || data.status === OrderStatus.EXPIRED || data.status === OrderStatus.CANCELLED

export default function Web3Status() {
  const walletInfo = useWalletInfo()
  const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)
  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const allRecentActivity = useRecentActivity()

  const { pendingActivity, confirmedActivity } = useMemo(() => {
    // Separate the array into 2: PENDING and FULFILLED(or CONFIRMED)+EXPIRED
    const pendingActivity = allRecentActivity.filter(isPending).map((data) => data.id)
    const confirmedActivity = allRecentActivity.filter(isConfirmed).map((data) => data.id)

    return {
      pendingActivity,
      confirmedActivity,
    }
  }, [allRecentActivity])

  const { active, ensName } = walletInfo
  if (!active && !latestProvider) {
    return null
  }

  return (
    <Wrapper>
      <Web3StatusInner pendingCount={pendingActivity.length} />
      <WalletModal ENSName={ensName} pendingTransactions={pendingActivity} confirmedTransactions={confirmedActivity} />
    </Wrapper>
  )
}
