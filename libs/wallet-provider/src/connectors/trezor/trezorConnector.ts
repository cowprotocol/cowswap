import trezorIcon from '@cowprotocol/assets/cow-swap/trezor.svg'
import { ConnectorController, Connector, AccountController } from '@web3modal/core'
import { TrezorProvider } from './TrezorProvider'
import trezorConnect from '@trezor/connect-web'
import type { TrezorConnect } from '@trezor/connect-web'
import transformTypedData from '@trezor/connect-plugin-ethereum'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { RPC_URLS } from '@cowprotocol/common-const'

export const TREZOR_CONNECTOR_ID = '622261d8-4734-4f4a-af8a-b1068904bd70'

const trezorConfig: Parameters<TrezorConnect['init']>[0] = {
  env: 'web',
  manifest: {
    email: 'dev@cow.fi',
    appUrl: 'https://cow.fi',
  },
}

export const trezorProvider = new TrezorProvider(
  RPC_URLS[getCurrentChainIdFromUrl()],
  trezorConnect,
  transformTypedData
)

export function addTrezorConnector() {
  trezorConnect.init(trezorConfig)

  const connector: Connector = {
    id: 'eip6963',
    type: 'EXTERNAL',
    name: 'Trezor',
    imageUrl: trezorIcon,
    explorerId: '',
    imageId: '',
    provider: trezorProvider,
    info: {
      uuid: TREZOR_CONNECTOR_ID,
      name: 'Safe App',
      icon: trezorIcon,
      rdns: '',
    },
  }

  // Register connector
  ConnectorController.addConnector(connector)

  trezorProvider.onInit(() => {
    AccountController.subscribe((state) => {
      if (state.isConnected) {
        AccountController.setConnectedWalletInfo(connector.info)
      }
    })
  })
}
