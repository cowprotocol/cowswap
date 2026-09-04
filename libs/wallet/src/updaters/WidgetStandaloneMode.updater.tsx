import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { ConnectorAlreadyConnectedError, useConnection } from 'wagmi'

import { isInjectedWidget, logWallet, normalizeError } from '@cowprotocol/common-utils'

import { ConnectorController, OptionsController } from '@reown/appkit-controllers'

import { COW_WIDGET_CONNECTOR_ID, SAFE_CONNECTOR_ID } from '../reown/consts'
import { appWalletContextAtom } from '../state/appWalletContext.atom'
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
  const setAppWalletContext = useSetAtom(appWalletContextAtom)
  const { connector } = useConnection()
  const disconnect = useDisconnectWallet()

  const isSafeApp = getIsSafeAppIframe()
  const isSafeConnector = connector?.id === SAFE_CONNECTOR_ID
  const isWidgetConnector = connector?.id === COW_WIDGET_CONNECTOR_ID
  const isDappMode = standaloneMode === false
  const isStandaloneMode = standaloneMode === true
  const isDisconnectInProgress = useRef(false)

  useEffect(() => {
    setAppWalletContext((state) => ({ ...state, standaloneMode }))
  }, [setAppWalletContext, standaloneMode])

  useEffect(() => {
    if (!isInjectedWidget() || isSafeApp) return

    // Widget defaults to standalone when `standaloneMode` is omitted.
    syncInjectedWalletDiscovery(standaloneMode !== false)
  }, [isSafeApp, standaloneMode])

  /**
   * Once in Dapp mode, disconnect any current wallet and connect to the widget connector
   */
  useEffect(() => {
    if (isSafeApp) return

    if (isDappMode) {
      ;(async function () {
        console.debug('[WidgetStandaloneModeUpdater] connect widget connector')

        await reownAppKit.disconnect()

        try {
          await connectWalletById(COW_WIDGET_CONNECTOR_ID, 'injected')
        } catch (err: unknown) {
          const error = normalizeError(err)

          // Auto-reconnect or the bridged provider's own connect event can beat us to it -
          // wagmi is already connected to this connector, nothing left to do.
          if (error instanceof ConnectorAlreadyConnectedError) return

          logWallet.error(new Error('Failed to connect widget connector', { cause: error }))
        }
      })()
    }
  }, [isDappMode, isSafeApp])

  /**
   * Once in standalone mode, disconnect widget configurator
   */
  useEffect(() => {
    if (isSafeApp) return

    if (isStandaloneMode) {
      console.debug('[WidgetStandaloneModeUpdater] disconnect widget connector')

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
  }, [isSafeApp, isStandaloneMode])

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
    const inDappMode = isDappMode && !isWidgetConnector
    const inStandaloneMode = isStandaloneMode && isWidgetConnector

    if (inDappMode || inStandaloneMode) {
      console.debug('[WidgetStandaloneModeUpdater] disconnect connector', { inDappMode, inStandaloneMode })

      isDisconnectInProgress.current = true

      disconnect().finally(() => {
        isDisconnectInProgress.current = false
      })
    }
  }, [isWidgetConnector, isDappMode, isStandaloneMode, disconnect, connector, isSafeApp, isSafeConnector])

  return null
}

/**
 * In `libs/wallet/src/wagmi/config.ts`, we set `enableEIP6963: !isWidget`. However, if widget is being used in
 * standalone mode, we need to re-enable EIP-6963 so browser wallets are discoverable.
 */
function syncInjectedWalletDiscovery(enableEIP6963: boolean): void {
  OptionsController.setEIP6963Enabled(enableEIP6963)

  if (!enableEIP6963) return

  // Not strictly necessary, but ensures new providers are discovered immediately.
  window.dispatchEvent(new Event('eip6963:requestProvider'))

  // Note: Brave Wallet will not be discovered, even if we call `flushDeferredProviders()` here.
  // TODO: See if that's related to Brave Shield or other setting.

  void wagmiAdapter.syncConnectors()
}
