import { ReactNode } from 'react'

import { useConnectionType, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { usePendingActivitiesCount } from 'common/hooks/usePendingActivitiesCount'

import { PendingOrdersPermitUpdater } from './PendingOrdersPermitUpdater/PendingOrdersPermitUpdater'

import { useShowUnfillableOrderAlert } from '../../hooks/useShowUnfillableOrderAlert'
import { Web3StatusInner } from '../../pure/Web3StatusInner'
import { Wrapper } from '../../pure/Web3StatusInner/styled'
import { AccountSelectorModal } from '../AccountSelectorModal'
import { WalletModal } from '../WalletModal'

export interface Web3StatusProps {
  className?: string
  onClick?: () => void
}

export function Web3Status({ className, onClick }: Web3StatusProps): ReactNode {
  const connectionType = useConnectionType()
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()

  const toggleWalletModal = useToggleWalletModal()
  const pendingCount = usePendingActivitiesCount()
  const showUnfillableOrdersAlert = useShowUnfillableOrderAlert()

  return (
    <Wrapper className={className} onClick={onClick}>
      {account && <PendingOrdersPermitUpdater />}
      <Web3StatusInner
        showUnfillableOrdersAlert={showUnfillableOrdersAlert}
        pendingCount={pendingCount}
        account={account}
        ensName={ensName}
        connectWallet={toggleWalletModal}
        connectionType={connectionType}
      />
      <WalletModal />
      <AccountSelectorModal />
    </Wrapper>
  )
}
