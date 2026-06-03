import { type ReactNode, useEffect, useRef } from 'react'

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
  const prevStandaloneMode = useRef(standaloneMode)

  useEffect(() => {
    if (!isInjectedWidget()) return

    const wasStandalone = prevStandaloneMode.current !== false
    const isDappMode = standaloneMode === false
    prevStandaloneMode.current = standaloneMode

    // When switching from standalone to dapp mode, disconnect the standalone wallet.
    // The widget connector (for dapp mode) will be reconnected by ReconnectOnMount
    // when the iframe is recreated after the dapp provides a provider.
    if (wasStandalone && isDappMode && connector && connector.id !== COW_WIDGET_CONNECTOR_ID) {
      void disconnect()
    }
  }, [standaloneMode, connector, disconnect])

  return null
}
