import { useOpenWalletModal, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { Web3StatusInner } from '../../pure/Web3StatusInner'
import { Wrapper } from '../../pure/Web3StatusInner/styled'
import { AccountSelectorModal } from '../AccountSelectorModal'
import { useCloseFollowTxPopupIfNotPendingOrder } from '../FollowPendingTxPopup'

export interface Web3StatusProps {
  pendingActivities: string[]
  className?: string
}
export function Web3Status({ pendingActivities, className }: Web3StatusProps) {
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()

  const openConnectWalletModal = useOpenWalletModal()

  useCloseFollowTxPopupIfNotPendingOrder()

  return (
    <Wrapper className={className}>
      <Web3StatusInner
        pendingCount={pendingActivities.length}
        account={account}
        ensName={ensName}
        connectWallet={openConnectWalletModal}
      />
      <AccountSelectorModal />
    </Wrapper>
  )
}
