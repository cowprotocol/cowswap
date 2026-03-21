import { ReactNode } from 'react'

import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'

import { walletConnectV2Option } from './walletConnectV2.constants'
import { getWalletConnectV2Connection } from './walletConnectV2.utils'

import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps } from '../types'

export function WalletConnectV2Option({ selectedWallet, tryActivation }: ConnectionOptionProps): ReactNode {
  const chainId = getCurrentChainIdFromUrl()
  const connection = getWalletConnectV2Connection(chainId)

  const isActive = useIsActiveConnection(selectedWallet, connection)

  return (
    <ConnectWalletOption
      {...walletConnectV2Option}
      isActive={isActive}
      clickable={!isActive}
      onClick={() => tryActivation(connection.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT_V2)}
    />
  )
}
