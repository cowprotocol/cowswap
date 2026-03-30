import { useSetAtom } from 'jotai'

import Close from '@cowprotocol/assets/images/x.svg?react'
import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'
import { Media, UI, SmartModal } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { toggleAccountSelectorModalAtom } from 'modules/wallet/containers/AccountSelectorModal/state'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

import { useAccountModalState } from '../../hooks/useAccountModalState'
import { useCloseAccountModalOnNavigate } from '../../hooks/useCloseAccountModalOnNavigate'
import { useToggleAccountModal } from '../../hooks/useToggleAccountModal'
import { AccountDetails } from '../AccountDetails'

export const Header = styled.div`
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
  z-index: 20;

  ${Media.upToMedium()} {
    top: 0;
    padding: 0 16px;
    z-index: 99999;
    position: sticky;
    left: 0;
    height: 52px;
    background: var(${UI.COLOR_PAPER});
  }

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > strong {
    font-size: 24px;
    color: inherit;

    ${Media.upToSmall()} {
      font-size: 18px;
    }
  }
`

const CloseIcon = styled((props) => <Close {...props} />)`
  --size: 20px;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  stroke: var(${UI.COLOR_TEXT});
  width: var(--size);
  height: var(--size);
  object-fit: contain;

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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrdersPanel() {
  const { active, account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const toggleAccountSelectorModal = useSetAtom(toggleAccountSelectorModalAtom)
  const { isOpen } = useAccountModalState()
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()

  const handleCloseOrdersPanel = useToggleAccountModal()

  useCloseAccountModalOnNavigate()

  const displayOrdersPanel = !!(active && isOpen && account)

  useBodyScrollbarLocker(displayOrdersPanel)

  if (!displayOrdersPanel) {
    return null
  }

  return (
    <SmartModal isOpen={isOpen} onDismiss={handleCloseOrdersPanel} drawerMediaQuery={Media.upToSmall(false)}>
      <Wrapper>
        <Header>
          <strong>
            <Trans>Account</Trans>ss
          </strong>
          <CloseIcon onClick={handleCloseOrdersPanel} />
        </Header>

        <AccountDetails
          ENSName={ensName}
          pendingTransactions={pendingActivity}
          confirmedTransactions={confirmedActivity}
          toggleAccountSelectorModal={toggleAccountSelectorModal}
          handleCloseOrdersPanel={handleCloseOrdersPanel}
        />
      </Wrapper>
    </SmartModal>
  )
}
