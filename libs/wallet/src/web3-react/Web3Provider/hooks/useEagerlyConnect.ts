import { useEffect } from 'react'

import { getCurrentChainIdFromUrl, isInjectedWidget } from '@cowprotocol/common-utils'
import { Connector } from '@web3-react/types'

import { BACKFILLABLE_WALLETS, ConnectionType } from '../../../api/types'
import { injectedWidgetConnection } from '../../connection/injectedWidget'
import { networkConnection } from '../../connection/network'
import { gnosisSafeConnection } from '../../connection/safe'
import { getWeb3ReactConnection } from '../../utils/getWeb3ReactConnection'

async function connect(connector: Connector) {
  const chainId = getCurrentChainIdFromUrl()

  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly(chainId)
    } else {
      await connector.activate(chainId)
    }
  } catch (error: any) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

export function useEagerlyConnect(selectedWallet: ConnectionType | undefined, selectedWalletBackfilled: boolean) {
  useEffect(() => {
    if (isInjectedWidget()) {
      connect(injectedWidgetConnection.connector)
    }

    // Try to connect to Gnosis Safe only when the app is opened in an iframe
    if (window.top !== window.self) {
      connect(gnosisSafeConnection.connector)
    }

    connect(networkConnection.connector)

    if (selectedWallet) {
      connect(getWeb3ReactConnection(selectedWallet).connector)
    } else if (!selectedWalletBackfilled) {
      BACKFILLABLE_WALLETS.map(getWeb3ReactConnection)
        .map((connection) => connection.connector)
        .forEach(connect)
    }
    // The dependency list is empty so this is only run once on mount
  }, [])
}
