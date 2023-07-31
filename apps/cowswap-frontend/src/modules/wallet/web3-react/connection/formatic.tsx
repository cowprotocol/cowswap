import { initializeConnector } from '@web3-react/core'

import { useIsActiveWallet } from '../../../../legacy/hooks/useIsActiveWallet'

import { ConnectionType } from '../../index'
import { default as FormaticImage } from '../../api/assets/formatic.png'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { getConnectionName } from '../../api/utils/connection'

import { AsyncConnector } from './asyncConnector'

import { TryActivation } from './index'

import { Web3ReactConnection } from '../types'

const [web3Fortmatic, web3FortmaticHooks] = initializeConnector<AsyncConnector>(
  (actions) =>
    new AsyncConnector(
      () =>
        Promise.all([import('@web3-react/eip1193'), import('fortmatic')]).then(([{ EIP1193 }, m]) => {
          const Fortmatic = m.default
          return new EIP1193({ actions, provider: new Fortmatic(process.env.REACT_APP_FORTMATIC_KEY).getProvider() })
        }),
      actions
    )
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
