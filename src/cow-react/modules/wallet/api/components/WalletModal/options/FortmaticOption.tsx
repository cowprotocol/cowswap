import { Connector } from '@web3-react/types'
import FORTMATIC_ICON_URL from '../../../assets/formatic.png'
import { ConnectionType, fortmaticConnection } from 'connection'
import { getConnectionName } from 'connection/utils'

import Option from '../Option'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet' // MOD

const BASE_PROPS = {
  color: '#6748FF',
  icon: FORTMATIC_ICON_URL,
  id: 'fortmatic',
}

export function FortmaticOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  // const isActive = fortmaticConnection.hooks.useIsActive()
  const isActive = useIsActiveWallet(fortmaticConnection) // MOD

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(fortmaticConnection.connector)}
      header={getConnectionName(ConnectionType.FORTMATIC)}
    />
  )
}
