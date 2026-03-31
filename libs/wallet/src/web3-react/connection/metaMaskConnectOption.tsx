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
