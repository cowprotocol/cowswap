import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ConnectorAlreadyConnectedError, useConnection } from 'wagmi'

import { isInjectedWidget, logWallet, normalizeError } from '@cowprotocol/common-utils'

import { ConnectorController, OptionsController } from '@reown/appkit-controllers'

import { COW_WIDGET_CONNECTOR_ID, SAFE_CONNECTOR_ID } from '../reown/consts'
import { appWalletContextAtom } from '../state/appWalletContext.atom'
import { connectWalletById } from '../utils/connectWalletById'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'
import { reownAppKit, wagmiAdapter } from '../wagmi/config'
import { useDisconnectWallet } from '../wagmi/hooks/useDisconnectWallet'

interface ConnectorReplacement {
  /** Disconnects with `disconnectCurrent`, then connects the widget connector if `shouldConnectWidget()` still holds */
  replaceConnector(disconnectCurrent: () => Promise<void>, shouldConnectWidget: () => boolean): void
  isReplacing(): boolean
  /** Bumps `recheckCount` once the running replacement settles */
  requestRecheck(): void
  recheckCount: number
}

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
 *    a non-widget connector in dapp mode, which is then replaced by the "cow-widget" connector (outside the Safe
 *    App), or the widget connector in standalone mode. The Safe App connection is left untouched.
 *
 * Effects 1 and 3 change the connector one at a time: a change asked for while another runs waits for it to settle
 * (effect 3 checks again, effect 1 is queued), and the "cow-widget" connector is only connected if dapp mode is still
 * on by then.
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
  const isDappModeRef = useRef(isDappMode)

  useEffect(() => {
    isDappModeRef.current = isDappMode
  }, [isDappMode])

  const { replaceConnector, isReplacing, requestRecheck, recheckCount } = useConnectorReplacement()

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
      console.debug('[WidgetStandaloneModeUpdater] connect widget connector')

      replaceConnector(
        () => reownAppKit.disconnect(),
        () => isDappModeRef.current,
      )
    }
  }, [isDappMode, isSafeApp, replaceConnector])

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
    if (isReplacing()) {
      requestRecheck()
      return
    }
    const inDappMode = isDappMode && !isWidgetConnector
    const inStandaloneMode = isStandaloneMode && isWidgetConnector

    if (inDappMode || inStandaloneMode) {
      console.debug('[WidgetStandaloneModeUpdater] disconnect connector', { inDappMode, inStandaloneMode })

      replaceConnector(disconnect, () => inDappMode && !isSafeApp && isDappModeRef.current)
    }
  }, [
    isWidgetConnector,
    isDappMode,
    isStandaloneMode,
    disconnect,
    connector,
    isSafeApp,
    isSafeConnector,
    recheckCount,
    isReplacing,
    requestRecheck,
    replaceConnector,
  ])

  return null
}

async function connectWidgetConnector(): Promise<void> {
  try {
    await connectWalletById(COW_WIDGET_CONNECTOR_ID, 'injected')
  } catch (err: unknown) {
    const error = normalizeError(err)

    // Auto-reconnect or the bridged provider's own connect event can beat us to it -
    // wagmi is already connected to this connector, nothing left to do.
    if (error instanceof ConnectorAlreadyConnectedError) return

    logWallet.error(new Error('Failed to connect widget connector', { cause: error }))
  }
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

/** Runs one connector replacement at a time: a replacement asked for meanwhile is queued, the latest one wins */
function useConnectorReplacement(): ConnectorReplacement {
  const isDisconnectInProgress = useRef(false)
  const isRecheckNeeded = useRef(false)
  const queuedReplacementRef = useRef<(() => void) | null>(null)
  const [recheckCount, setRecheckCount] = useState(0)

  const replaceConnector = useCallback(
    (disconnectCurrent: () => Promise<void>, shouldConnectWidget: () => boolean): void => {
      const run = (): void => {
        isDisconnectInProgress.current = true

        disconnectCurrent()
          .catch((err: unknown) => {
            logWallet.error(new Error('Failed to disconnect the current connector', { cause: normalizeError(err) }))
          })
          .then(() => (shouldConnectWidget() ? connectWidgetConnector() : undefined))
          .finally(() => {
            isDisconnectInProgress.current = false

            const queuedReplacement = queuedReplacementRef.current
            queuedReplacementRef.current = null

            if (queuedReplacement) {
              queuedReplacement()
              return
            }

            if (isRecheckNeeded.current) {
              isRecheckNeeded.current = false
              setRecheckCount((count) => count + 1)
            }
          })
      }

      if (isDisconnectInProgress.current) {
        queuedReplacementRef.current = run
        return
      }

      run()
    },
    [],
  )

  const isReplacing = useCallback(() => isDisconnectInProgress.current, [])
  const requestRecheck = useCallback(() => {
    isRecheckNeeded.current = true
  }, [])

  return { replaceConnector, isReplacing, requestRecheck, recheckCount }
}
