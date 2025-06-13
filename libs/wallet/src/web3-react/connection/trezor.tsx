import { initializeConnector } from '@web3-react/core'

import { default as TrezorImage } from '../../api/assets/trezor.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { TrezorConnector } from '../connectors/TrezorConnector'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

const BASE_PROPS = {
  color: '#4196FC',
  icon: TrezorImage,
  id: 'trezor',
}

const [trezor, trezorHooks] = initializeConnector<TrezorConnector>((actions) => new TrezorConnector(actions))

export const trezorConnection: Web3ReactConnection<TrezorConnector> = {
  connector: trezor,
  hooks: trezorHooks,
  type: ConnectionType.TREZOR,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TrezorOption({ selectedWallet, tryActivation }: ConnectionOptionProps) {
  const isActive = useIsActiveConnection(selectedWallet, trezorConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(trezorConnection.connector)}
      header={getConnectionName(ConnectionType.TREZOR)}
    />
  )
}
