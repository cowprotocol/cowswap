import { useWeb3React } from '@web3-react/core'

import { useCloseFollowTxPopupIfNotPendingOrder } from 'legacy/components/Popups/FollowPendingTxPopup'
import { STORAGE_KEY_LAST_PROVIDER } from 'legacy/constants'
import { useToggleWalletModal } from 'legacy/state/application/hooks'
import { useAppSelector } from 'legacy/state/hooks'

import { useWalletDetails, useWalletInfo, WalletModal, AccountSelectorModal } from 'modules/wallet'
import { Web3StatusInner } from 'modules/wallet/api/pure/Web3StatusInner'
import { Wrapper } from 'modules/wallet/api/pure/Web3StatusInner/styled'
import { getWeb3ReactConnection } from 'modules/wallet/web3-react/connection'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

export function Web3Status() {
  const { connector } = useWeb3React()
  const { account, active, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const connectionType = getWeb3ReactConnection(connector).type

  const error = useAppSelector(
    (state) => state.connection.errorByConnectionType[getWeb3ReactConnection(connector).type]
  )

  const toggleWalletModal = useToggleWalletModal()
  useCloseFollowTxPopupIfNotPendingOrder()

  const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

  const { pendingActivity } = useCategorizeRecentActivity()

  if (!active && !latestProvider) {
    return null
  }

  return (
    <Wrapper>
      <Web3StatusInner
        pendingCount={pendingActivity.length}
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
