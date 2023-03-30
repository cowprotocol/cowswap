import { Connector } from '@web3-react/types'
import { ConnectionType } from '@cow/modules/wallet'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { default as TrezorImage } from '@cow/modules/wallet/api/assets/trezor.svg'
import { Trezor } from '../connectors/Trezor'
import { initializeConnector } from '@web3-react/core'
import { Web3ReactConnection } from '../types'
import { RPC_URLS } from '@src/custom/constants/networks'

const MANIFEST_APP_URL = 'https://swap.cow.fi/'
const MANIFEST_APP_EMAIL = 'help@cow.fi'

const BASE_PROPS = {
  color: '#4196FC',
  icon: TrezorImage,
  id: 'trezor',
}

const [trezor, trezorHooks] = initializeConnector<Trezor>(
  (actions) =>
    new Trezor({
      actions,
      options: {
        manifestAppUrl: MANIFEST_APP_URL,
        manifestEmail: MANIFEST_APP_EMAIL,
        url: RPC_URLS[1],
      },
    })
)
export const trezorConnection: Web3ReactConnection = {
  connector: trezor,
  hooks: trezorHooks,
  type: ConnectionType.TREZOR,
}

export function TrezorOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(trezorConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(trezorConnection.connector)}
      header={getConnectionName(ConnectionType.TREZOR)}
    />
  )
}
