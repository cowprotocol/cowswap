import { Connector } from '@web3-react/types'
import FORTMATIC_ICON_URL from 'assets/images/fortmaticIcon.png'
import { ConnectionType, fortmaticConnection } from 'connection'
import { getConnectionName } from 'connection/utils'

import Option from 'components/WalletModal/Option'
import { useSelectedWallet } from 'state/user/hooks'

const BASE_PROPS = {
  color: '#6748FF',
  icon: FORTMATIC_ICON_URL,
  id: 'fortmatic',
}

export function FortmaticOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  // const isActive = fortmaticConnection.hooks.useIsActive()
  // MOD
  const selectedWallet = useSelectedWallet()
  const isActive = selectedWallet === ConnectionType.FORTMATIC
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(fortmaticConnection.connector)}
      header={getConnectionName(ConnectionType.FORTMATIC)}
    />
  )
}
