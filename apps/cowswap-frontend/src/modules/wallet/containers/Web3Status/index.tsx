import { useWeb3React } from '@web3-react/core'

import { STORAGE_KEY_LAST_PROVIDER } from '@cowswap/common-const'
import { useToggleWalletModal } from 'legacy/state/application/hooks'
import { useAppSelector } from 'legacy/state/hooks'

import { useWalletDetails, useWalletInfo } from '../../../../../../../libs/wallet/src/api/hooks'
import { Web3StatusInner } from '../../../../../../../libs/wallet/src/api/pure/Web3StatusInner'
import { Wrapper } from '../../../../../../../libs/wallet/src/api/pure/Web3StatusInner/styled'
import { getWeb3ReactConnection } from '../../../../../../../libs/wallet/src/web3-react/utils/getWeb3ReactConnection'
import { AccountSelectorModal } from '../../../../../../../libs/wallet/src/web3-react/containers/AccountSelectorModal'
import { WalletModal } from '../WalletModal'
import { useCloseFollowTxPopupIfNotPendingOrder } from '../FollowPendingTxPopup'

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

  const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

  if (!active && !latestProvider) {
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
