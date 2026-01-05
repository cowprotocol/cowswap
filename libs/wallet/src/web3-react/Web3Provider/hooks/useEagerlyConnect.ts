import { useEffect, useRef, useState } from 'react'

import { getCurrentChainIdFromUrl, isInjectedWidget } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { Connector } from '@web3-react/types'

import {
  useSelectedEip6963ProviderInfo,
  useSetEip6963Provider,
  useBeginEagerConnect,
  useEndEagerConnect,
} from '../../../api/hooks'
import { selectedEip6963ProviderRdnsAtom } from '../../../api/state/multiInjectedProvidersAtom'
import { ConnectionType } from '../../../api/types'
import { getIsInjectedMobileBrowser } from '../../../api/utils/connection'
import { injectedWalletConnection } from '../../connection/injectedWallet'
import { networkConnection } from '../../connection/network'
import { gnosisSafeConnection } from '../../connection/safe'
import { getWeb3ReactConnection } from '../../utils/getWeb3ReactConnection'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function connect(connector: Connector) {
  const chainId = getCurrentChainIdFromUrl()

  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly(chainId)
    } else {
      await connector.activate(chainId)
    }
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

export function useEagerlyConnect(selectedWallet: ConnectionType | undefined, standaloneMode?: boolean): void {
  const [tryConnectEip6963Provider, setTryConnectEip6963Provider] = useState(false)
  const eagerlyConnectInitRef = useRef(false)
  const selectedEip6963ProviderInfo = useSelectedEip6963ProviderInfo()
  const setEip6963Provider = useSetEip6963Provider()
  const beginEagerConnect = useBeginEagerConnect()
  const endEagerConnect = useEndEagerConnect()

  useEffect(() => {
    // Initialize EagerlyConnect once
    if (eagerlyConnectInitRef.current) return

    const isIframe = window.top !== window.self

    // autoConnect is set to true in the e2e tests
    const start = (p: Promise<void>): void => {
      beginEagerConnect()
      void p.finally(() => endEagerConnect())
    }

    if (isInjectedWidget() || getIsInjectedMobileBrowser() || window.ethereum?.autoConnect) {
      start(connect(injectedWalletConnection.connector))
    }

    // Try to connect to Gnosis Safe only when the app is opened in an iframe
    if (isIframe) {
      start(connect(gnosisSafeConnection.connector))
    }

    start(connect(networkConnection.connector))

    if (selectedWallet) {
      const connection = getWeb3ReactConnection(selectedWallet)
      const cachedProviderRdns = jotaiStore.get(selectedEip6963ProviderRdnsAtom)

      /**
       * Skip activation if an injected eip6963 provider was previously selected
       * Because it will be activated in the next useEffect() block
       */
      if (connection.type === ConnectionType.INJECTED && cachedProviderRdns) {
        setTryConnectEip6963Provider(true)
      } else {
        start(connect(connection.connector))
      }
    }

    eagerlyConnectInitRef.current = true
    // The dependency list is empty so this is only run once on mount
  }, [selectedWallet, beginEagerConnect, endEagerConnect])

  /**
   * Activate the selected eip6963 provider
   */
  useEffect(() => {
    // Ignore remembered eip6963 provider if the app is in widget dapp mode
    if (isInjectedWidget() && !standaloneMode) return
    if (!selectedWallet || !tryConnectEip6963Provider) return

    const connection = getWeb3ReactConnection(selectedWallet)

    if (connection.type === ConnectionType.INJECTED && selectedEip6963ProviderInfo) {
      const { provider, info } = selectedEip6963ProviderInfo
      const { connector } = injectedWalletConnection

      connector.provider = provider
      connector.onConnect = () => setEip6963Provider(info.rdns)
      connector.onDisconnect = () => setEip6963Provider(null)

      setTryConnectEip6963Provider(false)
      beginEagerConnect()
      connect(connector)
        .catch(() => void 0)
        .finally(() => endEagerConnect())
    }
  }, [
    standaloneMode,
    selectedEip6963ProviderInfo,
    selectedWallet,
    setEip6963Provider,
    tryConnectEip6963Provider,
    beginEagerConnect,
    endEagerConnect,
  ])
}
