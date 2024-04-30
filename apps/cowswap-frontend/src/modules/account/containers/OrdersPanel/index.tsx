import { useSetAtom } from 'jotai'

import Close from '@cowprotocol/assets/images/x.svg?react'
import { UI } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { toggleAccountSelectorModalAtom } from 'modules/wallet/containers/AccountSelectorModal/state'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

import { useAccountModalState } from '../../hooks/useAccountModalState'
import { useToggleAccountModal } from '../../hooks/useToggleAccountModal'
import { AccountDetails } from '../AccountDetails'

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
  z-index: 5;
  padding: 0;
  cursor: default;
  overflow-y: hidden;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  background: var(${UI.COLOR_PAPER});

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: ${theme.isInjectedWidgetMode ? '24px' : '0'};
  `};
`

const SidebarBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => (theme.isInjectedWidgetMode ? 'transparent' : transparentize(theme.black, 0.1))};
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
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;
  background: var(${UI.COLOR_PAPER});
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
    background: var(${UI.COLOR_PAPER});
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

const CloseIcon = styled((props) => <Close {...props} />)`
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  stroke: var(${UI.COLOR_TEXT});
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

// TODO: rename the component into AccountModal
export function OrdersPanel() {
  const { active } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const toggleWalletModal = useToggleWalletModal()
  const toggleAccountSelectorModal = useSetAtom(toggleAccountSelectorModalAtom)
  const { isOpen } = useAccountModalState()
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()

  const handleCloseOrdersPanel = useToggleAccountModal()

  if (!active || !isOpen) {
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
            ENSName={ensName}
            pendingTransactions={pendingActivity}
            confirmedTransactions={confirmedActivity}
            toggleWalletModal={toggleWalletModal}
            toggleAccountSelectorModal={toggleAccountSelectorModal}
            handleCloseOrdersPanel={handleCloseOrdersPanel}
          />
        </Wrapper>
      </SideBar>
    </>
  )
}
