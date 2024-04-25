import type { TrezorConnect } from '@trezor/connect-web'
import type { Provider } from '@web3modal/scaffold-utils/dist/types/exports/ethers'
import type { TrezorProvider } from './TrezorProvider'

import { ConnectorController, Connector, AccountController } from '@web3modal/core'
import { getCurrentChainIdFromUrl, isMobile } from '@cowprotocol/common-utils'
import { RPC_URLS } from '@cowprotocol/common-const'
import { lazyLoadedProvider } from '../lazyLoadedProvider'

import trezorIcon from '@cowprotocol/assets/cow-swap/trezor.svg'

export const TREZOR_CONNECTOR_ID = '622261d8-4734-4f4a-af8a-b1068904bd70'

const trezorConfig: Parameters<TrezorConnect['init']>[0] = {
  env: 'web',
  manifest: {
    email: 'dev@cow.fi',
    appUrl: 'https://cow.fi',
  },
}

export let trezorProvider: TrezorProvider | null = null

export function addTrezorConnector() {
  if (isMobile) return

  const connector: Connector = {
    id: 'eip6963',
    type: 'EXTERNAL',
    name: 'Trezor',
    imageUrl: trezorIcon,
    explorerId: '',
    imageId: '',
    provider: lazyLoadedProvider(() =>
      Promise.all([import('./TrezorProvider'), import('@trezor/connect-web')]).then(
        ([{ TrezorProvider }, { default: trezorConnect }]) => {
          return trezorConnect.init(trezorConfig).then(() => {
            trezorProvider = new TrezorProvider(RPC_URLS[getCurrentChainIdFromUrl()], trezorConnect)

            trezorProvider.onInit(() => {
              AccountController.subscribe((state) => {
                if (state.isConnected) {
                  AccountController.setConnectedWalletInfo(connector.info)
                }
              })
            })

            return trezorProvider as Provider
          })
        }
      )
    ),
    info: {
      uuid: TREZOR_CONNECTOR_ID,
      name: 'Safe App',
      icon: trezorIcon,
      rdns: '',
    },
  }

  // Register connector
  ConnectorController.addConnector(connector)
}
