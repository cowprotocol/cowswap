import { useWalletDetails, useWalletInfo, getWeb3ReactConnection } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { useToggleWalletModal } from 'legacy/state/application/hooks'
import { useAppSelector } from 'legacy/state/hooks'

import { Web3StatusInner } from '../../pure/Web3StatusInner'
import { Wrapper } from '../../pure/Web3StatusInner/styled'
import { AccountSelectorModal } from '../AccountSelectorModal'
import { useCloseFollowTxPopupIfNotPendingOrder } from '../FollowPendingTxPopup'
import { WalletModal } from '../WalletModal'

export function Web3Status({ pendingActivities }: { pendingActivities: string[] }) {
  const { connector } = useWeb3React()
  const { account, active, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const connectionType = getWeb3ReactConnection(connector).type

  const error = useAppSelector(
    (state) => state.connection.errorByConnectionType[getWeb3ReactConnection(connector).type]
  )

  const toggleWalletModal = useToggleWalletModal()
  useCloseFollowTxPopupIfNotPendingOrder()

  if (!active) {
    return null
  }

  return (
    <Wrapper>
      <Web3StatusInner
        pendingCount={pendingActivities.length}
        account={account}
        chainId={chainId}
        error={error}
        ensName={ensName}
        connectWallet={toggleWalletModal}
        connectionType={connectionType}
      />
      <WalletModal />
      <AccountSelectorModal />
    </Wrapper>
  )
}
