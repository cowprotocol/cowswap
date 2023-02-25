import { ConnectionType } from '@cow/modules/wallet'

import { fortmaticConnection } from '@cow/modules/wallet/web3-react/utils/connection/connections'
import { getConnectionName } from '@cow/modules/wallet/web3-react/utils/connection'

import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'

import { formaticOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption/ConnectWalletOptions'
import { TryActivation } from '..'

export function FortmaticOption({ tryActivation }: { tryActivation: TryActivation }) {
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
