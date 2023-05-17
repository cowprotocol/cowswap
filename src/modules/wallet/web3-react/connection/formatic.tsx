import { ConnectionType } from 'modules/wallet'

import { getConnectionName } from 'modules/wallet/api/utils/connection'

import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'

import { initializeConnector } from '@web3-react/core'

import { TryActivation } from '.'
import { Web3ReactConnection } from '../types'

import { default as FormaticImage } from 'modules/wallet/api/assets/formatic.png'
import { AsyncConnector } from './asyncConnector'

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
