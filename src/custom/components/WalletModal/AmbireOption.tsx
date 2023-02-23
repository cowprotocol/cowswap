import { Connector } from '@web3-react/types'
import AMBIRE_ICON_URL from 'assets/images/ambire.svg'
import { ConnectionType, walletConnectConnection } from 'connection'
import { getConnectionName } from 'connection/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from 'components/WalletModal/Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: AMBIRE_ICON_URL,
  id: 'ambire',
}

export function AmbireOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(walletConnectConnection)
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.AMBIRE)}
    />
  )
}
