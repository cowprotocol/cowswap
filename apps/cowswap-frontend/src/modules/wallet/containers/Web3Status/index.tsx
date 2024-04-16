import { useWalletDetails, useWalletInfo, getWeb3ReactConnection } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'
import { useWeb3Modal } from '@web3modal/ethers5/react'

import { Web3StatusInner } from '../../pure/Web3StatusInner'
import { Wrapper } from '../../pure/Web3StatusInner/styled'
import { AccountSelectorModal } from '../AccountSelectorModal'
import { useCloseFollowTxPopupIfNotPendingOrder } from '../FollowPendingTxPopup'

export interface Web3StatusProps {
  pendingActivities: string[]
  className?: string
}
export function Web3Status({ pendingActivities, className }: Web3StatusProps) {
  const { connector } = useWeb3React()
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const connectionType = getWeb3ReactConnection(connector).type

  const { open: openConnectWalletModal } = useWeb3Modal()

  useCloseFollowTxPopupIfNotPendingOrder()

  return (
    <Wrapper className={className}>
      <Web3StatusInner
        pendingCount={pendingActivities.length}
        account={account}
        ensName={ensName}
        connectWallet={openConnectWalletModal}
        connectionType={connectionType}
      />
      <AccountSelectorModal />
    </Wrapper>
  )
}
