import { useWalletDetails, useWalletInfo, useConnectionType } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { Web3StatusInner } from '../../pure/Web3StatusInner'
import { Wrapper } from '../../pure/Web3StatusInner/styled'
import { AccountSelectorModal } from '../AccountSelectorModal'
import { useCloseFollowTxPopupIfNotPendingOrder } from '../FollowPendingTxPopup'
import { WalletModal } from '../WalletModal'

export interface Web3StatusProps {
  pendingActivities: string[]
  className?: string
  onClick?: () => void
}
export function Web3Status({ pendingActivities, className, onClick }: Web3StatusProps) {
  const connectionType = useConnectionType()
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()

  const toggleWalletModal = useToggleWalletModal()
  useCloseFollowTxPopupIfNotPendingOrder()

  return (
    <Wrapper className={className} onClick={onClick}>
      <Web3StatusInner
        pendingCount={pendingActivities.length}
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
