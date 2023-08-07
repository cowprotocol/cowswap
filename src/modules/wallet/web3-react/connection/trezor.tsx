import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { Actions, Connector } from '@web3-react/types'

import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

import { AsyncConnector } from './asyncConnector'

import { RPC_URLS } from '../../../../legacy/constants/networks'
import { default as TrezorImage } from '../../api/assets/trezor.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { Web3ReactConnection } from '../types'

const BASE_PROPS = {
  color: '#4196FC',
  icon: TrezorImage,
  id: 'trezor',
}

const defaultChainId = getCurrentChainIdFromUrl()

class TrezorConnector extends Network {
  constructor(actions: Actions) {
    super({ actions, urlMap: RPC_URLS, defaultChainId })
  }

  activate(desiredChainId: number = defaultChainId): Promise<void> {
    return super.activate(desiredChainId)
  }
}

const [trezor, trezorHooks] = initializeConnector<AsyncConnector>(
  (actions) =>
    new AsyncConnector(
      () =>
        Promise.all([import('@trezor/connect-web'), import('@trezor/connect-plugin-ethereum')]).then(
          ([{ default: TrezorConnect }, { default: transformTypedDataPlugin }]) => {
            TrezorConnect.init({
              env: 'web',
              manifest: {
                email: 'developer@xyz.com',
                appUrl: 'http://your.application.com',
              },
            })

            // TODO
            console.log('GGGGG', transformTypedDataPlugin)

            return new TrezorConnector(actions)
          }
        ),
      actions
    )
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
