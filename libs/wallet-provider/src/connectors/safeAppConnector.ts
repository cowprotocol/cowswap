import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { SafeAppProvider } from '@safe-global/safe-apps-provider'
import { ConnectionController, ConnectorController, AccountController, Connector } from '@web3modal/core'

export const safeAppsSDK = new SafeAppsSDK()
export const SAFE_CONNECTOR_UID = '7b4821b8-573a-424c-a323-c5abcf8a6129'

export function addSafeAppConnector() {
  safeAppsSDK.safe.getInfo().then((info) => {
    const provider = new SafeAppProvider(info, safeAppsSDK)

    const icon = 'https://user-images.githubusercontent.com/3975770/212338977-5968eae5-bb1b-4e71-8f82-af5282564c66.png'
    const connector: Connector = {
      id: 'eip6963',
      type: 'EXTERNAL',
      name: 'Safe App',
      imageUrl: icon,
      explorerId: '',
      imageId: '',
      provider,
      info: {
        uuid: SAFE_CONNECTOR_UID,
        name: 'Safe App',
        icon,
        rdns: '',
      },
    }

    // Register connector
    ConnectorController.addConnector(connector)

    AccountController.subscribe((state) => {
      if (state.isConnected) {
        AccountController.setConnectedWalletInfo(connector.info)
      }
    })

    // Automatically connect
    ConnectionController.connectExternal(connector)
  })
}
