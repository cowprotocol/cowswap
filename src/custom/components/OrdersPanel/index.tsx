import React, { useMemo } from 'react'
import styled from 'styled-components/macro'
import { ReactComponent as Close } from 'assets/images/x.svg'
import AccountDetails from 'components/AccountDetails'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { OrderStatus } from 'state/orders/actions'
import { useWalletModalToggle } from 'state/application/hooks'
import { transparentize } from 'polished'

const SideBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-flow: row wrap;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 750px;
  height: 80vh;
  border-radius: 24px;
  margin: auto;
  bottom: 0;
  left: 0;
  z-index: 99;
  padding: 0;
  cursor: default;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  box-shadow: 0 16px 32px 0 rgb(0 0 0 / 5%);
  animation: slideIn 0.3s cubic-bezier(0.87, 0, 0.13, 1);
  ${({ theme }) => theme.card.background2};
  backdrop-filter: blur(25px);

  ${({ theme }) => theme.mediaWidth.upToMedium`    
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
    backdrop-filter: blur(65px);
  `};

  &::-webkit-scrollbar {
    width: 16px;
    border-radius: 16px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.card.border};
    border: 4px solid transparent;
    border-radius: 16px;
    background-clip: padding-box;
  }

  &::-webkit-resizer,
  &::-webkit-scrollbar-button,
  &::-webkit-scrollbar-corner {
    height: 6px;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-100vh);
    }
    to {
      transform: translateY(0);
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
  z-index: 1;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => transparentize(0.4, theme.black)};
  backdrop-filter: blur(3px);

  ${({ theme }) => theme.mediaWidth.upToSmall`    
    display: none;
  `};
`

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20px 30px;
  align-items: center;
  transition: opacity 0.2s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: 0;
    padding: 0 16px;
    z-index: 99999;
    position: sticky;
    left: 0;
    height: 52px;
    backdrop-filter: blur(5px);
    ${({ theme }) => theme.card.background2};
  `};

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > strong {
    font-size: 15px;
    ${({ theme }) => theme.text1};
  }
`

const CloseIcon = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  height: auto;
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
          <Header>
            <strong>Account</strong>
            <CloseIcon onClick={closeOrdersPanel} />
          </Header>

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
