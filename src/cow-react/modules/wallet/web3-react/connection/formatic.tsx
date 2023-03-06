import { ConnectionType } from '@cow/modules/wallet'

import Fortmatic from 'fortmatic'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'

import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'

import { initializeConnector } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'

import { TryActivation } from '.'
import { Web3ReactConnection } from '../types'

import { default as FormaticImage } from '@cow/modules/wallet/api/assets/formatic.png'

const [web3Fortmatic, web3FortmaticHooks] = initializeConnector<EIP1193>(
  (actions) => new EIP1193({ actions, provider: new Fortmatic(process.env.REACT_APP_FORTMATIC_KEY).getProvider() })
)
export const fortmaticConnection: Web3ReactConnection = {
  connector: web3Fortmatic,
  hooks: web3FortmaticHooks,
  type: ConnectionType.FORTMATIC,
}

export const formaticOption = {
  color: '#6748FF',
  icon: FormaticImage,
  id: 'fortmatic',
}

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
