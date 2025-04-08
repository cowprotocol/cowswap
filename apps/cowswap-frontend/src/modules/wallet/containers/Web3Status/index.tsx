import { useConnectionType, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { usePendingOrdersFillability } from '../../../../common/hooks/usePendingOrdersFillability'
import { Web3StatusInner } from '../../pure/Web3StatusInner'
import { Wrapper } from '../../pure/Web3StatusInner/styled'
import { AccountSelectorModal } from '../AccountSelectorModal'
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

  const ordersFillability = usePendingOrdersFillability()
  const unfillableOrders = Object.keys(ordersFillability).filter((key) => {
    if (!pendingActivities.includes(key)) return false

    const order = ordersFillability[key]

    return order.hasEnoughBalance === false || order.hasEnoughAllowance === false
  })

  return (
    <Wrapper className={className} onClick={onClick}>
      <Web3StatusInner
        pendingCount={pendingActivities.length}
        unfillableOrdersCount={unfillableOrders.length}
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
