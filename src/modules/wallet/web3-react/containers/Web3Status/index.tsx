import { useWalletDetails, useWalletInfo, WalletModal } from 'modules/wallet'
import { STORAGE_KEY_LAST_PROVIDER } from 'constants/index'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

import { useWeb3React } from '@web3-react/core'
import { getWeb3ReactConnection } from 'modules/wallet/web3-react/connection'
import { useAppSelector } from 'state/hooks'

import { useToggleWalletModal } from 'state/application/hooks'
import { useCloseFollowTxPopupIfNotPendingOrder } from 'components/Popups/FollowPendingTxPopup'
import { Web3StatusInner } from 'modules/wallet/api/pure/Web3StatusInner'
import { Wrapper } from 'modules/wallet/api/pure/Web3StatusInner/styled'

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
    </Wrapper>
  )
}
