import { useMemo } from 'react'
import styled from 'styled-components/macro'
import WalletModal from 'components/WalletModal'
import { Web3StatusInner, Web3StatusConnected, Text } from './Web3StatusMod'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { getStatusIcon } from 'components/AccountDetails'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { ButtonSecondary } from 'components/Button'
import { OrderStatus } from '@src/custom/state/orders/actions'
import { STORAGE_KEY_LAST_PROVIDER } from 'constants/index'

export const Wrapper = styled.div`
  color: ${({ theme }) => theme.wallet?.color};
  width: 100%;
  display: flex;
  justify-content: center;

  ${ButtonSecondary} {
    height: 38px;
    max-width: 180px;
    ${({ theme }) => theme.mediaWidth.upToVerySmall`
        max-width: 100%;
      `};
    > p {
      font-size: 15px;

      ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        font-size: 13px;
      `};
    }
  }

  ${Web3StatusConnected} {
    color: ${({ theme }) => theme.wallet?.color};
    background: ${({ theme }) => theme.wallet?.background};
    height: 38px;
    border: 1px solid transparent;
    box-shadow: none;
    transform: none;

    &:hover {
      border: 1px solid ${({ theme }) => theme.primary1};
    }

    > div > svg > path {
      stroke: ${({ theme }) => theme.black};
    }
  }

  ${Text} {
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      font-size: 13px;
      margin: 0 0.5rem 0 0.25rem;
    `}
  }
`

const isPending = (data: TransactionAndOrder) =>
  data.status === OrderStatus.PENDING || data.status === OrderStatus.PRESIGNATURE_PENDING

const isConfirmed = (data: TransactionAndOrder) =>
  data.status === OrderStatus.FULFILLED || data.status === OrderStatus.EXPIRED || data.status === OrderStatus.CANCELLED

function StatusIcon({ connector }: { connector: AbstractConnector }): JSX.Element | null {
  const walletInfo = useWalletInfo()
  return getStatusIcon(connector, walletInfo)
}

interface Web3StatusProps {
  openOrdersPanel: () => void
}

export default function Web3Status({ openOrdersPanel }: Web3StatusProps) {
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

  const { active, activeNetwork, ensName } = walletInfo
  if (!activeNetwork && !active && !latestProvider) {
    return null
  }

  return (
    <Wrapper>
      <Web3StatusInner
        pendingCount={pendingActivity.length}
        StatusIconComponent={StatusIcon}
        openOrdersPanel={openOrdersPanel}
        thereWasAProvider={!!latestProvider}
      />
      <WalletModal ENSName={ensName} pendingTransactions={pendingActivity} confirmedTransactions={confirmedActivity} />
    </Wrapper>
  )
}
