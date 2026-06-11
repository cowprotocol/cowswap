import { useEffect, useRef } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { ConnectorController } from '@reown/appkit-controllers'
import { useConnection } from 'wagmi'

import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'
import { connectWalletById } from '../utils/connectWalletById'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'
import { reownAppKit, wagmiAdapter } from '../wagmi/config'
import { useDisconnectWallet } from '../wagmi/hooks/useDisconnectWallet'

interface WidgetStandaloneModeUpdaterProps {
  standaloneMode: boolean | undefined
}

/**
 * Keeps the wallet connection in sync with the widget's `standaloneMode` setting.
 *
 * The CoW widget can run in two modes:
 * - Dapp mode (`standaloneMode === false`): the embedding dapp owns the wallet connection,
 *   so the widget connects to the special "cow-widget" connector and must never use its own wallet.
 * - Standalone mode (`standaloneMode === true`): the widget owns the wallet connection,
 *   so the "cow-widget" connector must never be used and is hidden from the Reown connection modal.
 *
 * To enforce that, this updater runs three effects:
 * 1. On entering dapp mode: disconnect the current wallet and connect the "cow-widget" connector.
 * 2. On entering standalone mode: disconnect the "cow-widget" connector and remove it from the
 *    Reown wallet connection modal so users can't pick it.
 * 3. Continuously (for injected widgets): disconnect any connector that is not allowed for the current mode -
 *    a non-widget connector in dapp mode, or the widget connector in standalone mode. The Safe App
 *    connection is left untouched.
 *
 * Renders nothing.
 */
export function WidgetStandaloneModeUpdater({ standaloneMode }: WidgetStandaloneModeUpdaterProps): null {
  const { connector } = useConnection()
  const disconnect = useDisconnectWallet()

  const isSafeApp = getIsSafeAppIframe()
  const isSafeConnector = connector?.id === 'safe'
  const isWidgetConnector = connector?.id === COW_WIDGET_CONNECTOR_ID
  const isDappMode = standaloneMode === false
  const isStandaloneMode = standaloneMode === true
  const isDisconnectInProgress = useRef(false)

  /**
   * Once in Dapp mode, disconnect any current wallet and connect to the widget connector
   */
  useEffect(() => {
    if (isDappMode) {
      ;(async function () {
        await reownAppKit.disconnect()
        connectWalletById(COW_WIDGET_CONNECTOR_ID, 'injected')
      })()
    }
  }, [isDappMode])

  /**
   * Once in standalone mode, disconnect widget configurator
   */
  useEffect(() => {
    if (isStandaloneMode) {
      wagmiAdapter.disconnect({ id: COW_WIDGET_CONNECTOR_ID })

      // Remove widget connector from the list in Reown wallet connection modal
      return ConnectorController.subscribe((state) => {
        const newConnectors = state.connectors.filter((c) => c.id !== COW_WIDGET_CONNECTOR_ID)

        if (newConnectors.length === state.connectors.length) return

        ConnectorController.state.connectors = newConnectors
        ConnectorController.state.allConnectors = newConnectors
        wagmiAdapter.syncConnections()
      })
    }

    return undefined
  }, [isStandaloneMode])

  /**
   * In dapp mode we only allow to be connected to the widget connector
   * In standalone mode never connect to widget connector
   */
  useEffect(() => {
    if (!isInjectedWidget()) return
    if (!connector) return
    // Do not disconnect Safe App
    if (isSafeApp && isSafeConnector) return
    if (isDisconnectInProgress.current) return

    if ((isDappMode && !isWidgetConnector) || (isStandaloneMode && isWidgetConnector)) {
      isDisconnectInProgress.current = true

      disconnect().finally(() => {
        isDisconnectInProgress.current = false
      })
    }
  }, [isWidgetConnector, isDappMode, isStandaloneMode, disconnect, connector, isSafeApp, isSafeConnector])

  return null
}
