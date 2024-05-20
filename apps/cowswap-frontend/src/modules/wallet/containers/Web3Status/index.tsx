import { getWeb3ReactConnection, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

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
  const { connector } = useWeb3React()
  const { account, active } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const connectionType = getWeb3ReactConnection(connector).type

  const toggleWalletModal = useToggleWalletModal()
  useCloseFollowTxPopupIfNotPendingOrder()

  if (!active) {
    return null
  }

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
