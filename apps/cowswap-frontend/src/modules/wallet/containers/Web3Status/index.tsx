import { useOpenWalletConnectionModal, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { Web3StatusInner } from '../../pure/Web3StatusInner'
import { Wrapper } from '../../pure/Web3StatusInner/styled'

export interface Web3StatusProps {
  pendingActivities: string[]
  className?: string
  onClick?: () => void
}

export function Web3Status({ pendingActivities, className, onClick }: Web3StatusProps) {
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()

  const toggleWalletModal = useOpenWalletConnectionModal()

  return (
    <Wrapper className={className} onClick={onClick}>
      <Web3StatusInner
        pendingCount={pendingActivities.length}
        account={account}
        ensName={ensName}
        connectWallet={toggleWalletModal}
      />
    </Wrapper>
  )
}
