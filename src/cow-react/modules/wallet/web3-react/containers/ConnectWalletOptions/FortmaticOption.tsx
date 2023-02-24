import { Connector } from '@web3-react/types'

import { ConnectionType, fortmaticConnection } from 'connection'
import { getConnectionName } from '@cow/modules/wallet/api/utils'

import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'

import { formaticOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption/ConnectWalletOptions'


export function FortmaticOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(fortmaticConnection)

  return (
    <ConnectWalletOption
      {...formaticOption}
      isActive={isActive}
      onClick={() => tryActivation(fortmaticConnection.connector)}
      header={getConnectionName(ConnectionType.FORTMATIC)}
    />
  )
}
