import { ReactNode } from 'react'

import { LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { useConnectionType, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKit } from '@reown/appkit/react'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { TradeOrdersPermitUpdater } from 'modules/ordersTable'

import { usePendingActivitiesCount } from 'common/hooks/usePendingActivitiesCount'

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
  const { open } = useAppKit()
  const connectionType = useConnectionType()
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()

  const toggleWalletModal = useToggleWalletModal()
  const pendingCount = usePendingActivitiesCount()
  const showUnfillableOrdersAlert = useShowUnfillableOrderAlert()

  return (
    <Wrapper className={className} onClick={onClick}>
      {account && <TradeOrdersPermitUpdater />}
      <Web3StatusInner
        showUnfillableOrdersAlert={showUnfillableOrdersAlert}
        pendingCount={pendingCount}
        account={account}
        ensName={ensName}
        connectWallet={LAUNCH_DARKLY_VIEM_MIGRATION ? () => open() : toggleWalletModal}
        connectionType={connectionType}
      />
      <WalletModal />
      <AccountSelectorModal />
    </Wrapper>
  )
}
