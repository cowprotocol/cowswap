import React, { useMemo } from 'react'
import styled from 'styled-components/macro'
import { ReactComponent as Close } from 'assets/images/x.svg'
import AccountDetails from 'components/AccountDetails'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { OrderStatus } from 'state/orders/actions'
import { useWalletModalToggle } from 'state/application/hooks'

const SideBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-flow: row wrap;
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100%;
  z-index: 99;
  padding: 0;
  background: ${({ theme }) => theme.bg1};
  cursor: default;
  overflow-y: auto;
  animation: slideIn 0.3s cubic-bezier(0.87, 0, 0.13, 1);

  ${({ theme }) => theme.mediaWidth.upToMedium`    
    width: 100%;
  `};

  @keyframes slideIn {
    from {
      transform: translateX(500px);
    }
    to {
      transform: translateX(0);
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`    
  @keyframes slideIn {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  `};
`

const SidebarBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  background: rgb(0 0 0 / 25%);

  ${({ theme }) => theme.mediaWidth.upToSmall`    
    display: none;
  `};
`

const CloseIcon = styled(Close)`
  z-index: 20;
  position: sticky;
  top: 0;
  width: 100%;
  height: 38px;
  padding: 10px 0;
  background: ${({ theme }) => theme.bg1};
  transition: filter 0.2s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: 0;
    z-index: 99999;
    position: fixed;
    left: 0;
    right: initial;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 42px;
    backdrop-filter: blur(5px);
  `};

  &:hover {
    cursor: pointer;
    filter: saturate(0.5);
  }

  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  height: 100%;
  width: 100%;
`

const isPending = (data: TransactionAndOrder) =>
  data.status === OrderStatus.PENDING || data.status === OrderStatus.PRESIGNATURE_PENDING

const isConfirmed = (data: TransactionAndOrder) =>
  data.status === OrderStatus.FULFILLED || data.status === OrderStatus.EXPIRED || data.status === OrderStatus.CANCELLED

export interface OrdersPanelProps {
  closeOrdersPanel: () => void
}

export default function OrdersPanel({ closeOrdersPanel }: OrdersPanelProps) {
  const walletInfo = useWalletInfo()
  const toggleWalletModal = useWalletModalToggle()

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
  const ENSName = ensName

  if (!activeNetwork && !active) {
    return null
  }

  return (
    <>
      <SidebarBackground onClick={closeOrdersPanel} />
      <SideBar>
        <Wrapper>
          <CloseIcon onClick={closeOrdersPanel} />
          <AccountDetails
            ENSName={ENSName}
            pendingTransactions={pendingActivity}
            confirmedTransactions={confirmedActivity}
            toggleWalletModal={toggleWalletModal}
            closeOrdersPanel={closeOrdersPanel}
          />
        </Wrapper>
      </SideBar>
    </>
  )
}
