import styled from 'styled-components/macro'
import { ReactComponent as Close } from 'assets/images/x.svg'
import { AccountDetails } from '../AccountDetails'
import { useWalletDetails, useWalletInfo } from '@cow/modules/wallet'
import { useToggleWalletModal } from 'state/application/hooks'
import { transparentize } from 'polished'
import { useCategorizeRecentActivity } from '@cow/common/hooks/useCategorizeRecentActivity'

const SideBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-flow: row wrap;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 850px;
  height: 80vh;
  border-radius: 24px;
  margin: auto;
  bottom: 0;
  left: 0;
  z-index: 102;
  padding: 0;
  cursor: default;
  overflow-y: hidden;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  background: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
  `};
`

const SidebarBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => transparentize(0.1, theme.black)};
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
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg1};
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 20;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: 0;
    padding: 0 16px;
    z-index: 99999;
    position: sticky;
    left: 0;
    height: 52px;
    background: ${({ theme }) => theme.bg1};
  `};

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > strong {
    font-size: 24px;
    color: inherit;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 18px;
    `};
  }
`

const CloseIcon = styled(Close)`
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out;
  stroke: ${({ theme }) => theme.text1};
  width: 24px;
  height: 24px;

  &:hover {
    opacity: 1;
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  height: inherit;
  width: 100%;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  ${({ theme }) => theme.colorScrollbar};
`

export interface OrdersPanelProps {
  handleCloseOrdersPanel: () => void
}

export function OrdersPanel({ handleCloseOrdersPanel }: OrdersPanelProps) {
  const { active } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const toggleWalletModal = useToggleWalletModal()

  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()

  const ENSName = ensName

  if (!active) {
    return null
  }

  return (
    <>
      <SidebarBackground onClick={handleCloseOrdersPanel} />
      <SideBar>
        <Wrapper>
          <Header>
            <strong>Account</strong>
            <CloseIcon onClick={handleCloseOrdersPanel} />
          </Header>

          <AccountDetails
            ENSName={ENSName}
            pendingTransactions={pendingActivity}
            confirmedTransactions={confirmedActivity}
            toggleWalletModal={toggleWalletModal}
            handleCloseOrdersPanel={handleCloseOrdersPanel}
          />
        </Wrapper>
      </SideBar>
    </>
  )
}
