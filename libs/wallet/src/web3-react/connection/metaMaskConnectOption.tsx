/**
 * The “MetaMask” row in the connect modal when we’re using MetaMask Connect (not an injected EIP-6963 entry).
 * Clicks call `tryActivation` on the connector from `metaMaskConnect.tsx`.
 */
import { ReactNode } from 'react'

import { metaMaskConnectConnection } from './metaMaskConnect'

import { default as MetamaskImage } from '../../api/assets/metamask.png'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps } from '../types'

const metaMaskOption = {
  color: '#E8831D',
  icon: MetamaskImage,
  id: 'metamask',
}

/** Presentational wallet tile; activation logic lives in the connector + web3-react. */
export function MetaMaskConnectOption({ tryActivation, selectedWallet }: ConnectionOptionProps): ReactNode {
  const isActive = useIsActiveConnection(selectedWallet, metaMaskConnectConnection)

  return (
    <ConnectWalletOption
      {...metaMaskOption}
      isActive={isActive}
      onClick={() => tryActivation(metaMaskConnectConnection.connector)}
      header={getConnectionName(ConnectionType.METAMASK)}
    />
  )
}
