import { Connector } from '@web3-react/types'
import ZENGO_ICON_URL from 'assets/images/zengo.svg'
import { ConnectionType, walletConnectConnection } from 'connection'
import { getConnectionName } from 'connection/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from '../Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: ZENGO_ICON_URL,
  id: 'zengo',
}

export function ZengoOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(walletConnectConnection)
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.ZENGO)}
    />
  )
}
