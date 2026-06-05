import { type ReactNode, useEffect } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { COW_WIDGET_CONNECTOR_ID, useDisconnectWallet } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { useConnection } from 'wagmi'

/**
 * When the widget switches from standalone mode to dapp mode (without iframe recreation),
 * the EIP-6963 wallet connection established in standalone mode stays active in wagmi.
 * This causes the widget to appear connected even though the dapp hasn't provided a provider.
 *
 * This updater watches for standaloneMode→false transitions and disconnects any active
 * non-widget connections so dapp mode starts clean.
 */
export function WidgetStandaloneModeUpdater(): ReactNode {
  const { standaloneMode } = useInjectedWidgetParams()
  const { connector } = useConnection()
  const disconnect = useDisconnectWallet()

  const isWidgetConnector = connector?.id === COW_WIDGET_CONNECTOR_ID
  const isDappMode = standaloneMode === false

  /**
   * In standalone mode we only allow to be connected to the widget connector
   */
  useEffect(() => {
    if (!isInjectedWidget()) return
    if (!connector) return

    if (isDappMode && !isWidgetConnector) {
      void disconnect()
    }
  }, [isWidgetConnector, isDappMode, disconnect, connector])

  return null
}
