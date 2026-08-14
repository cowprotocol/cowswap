import { EIP1193Provider } from 'viem'
import type { CreateConnectorFn } from 'wagmi'

import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { injected, metaMask, safe } from '@wagmi/connectors'

import { getInjectedProvider } from '../api/utils/connection'
import { createIsolatedProvider } from '../providerIsolation'
import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'

export function getConnectors(): CreateConnectorFn[] | undefined {
  const isSafeApp = getIsSafeAppIframe()
  const isWidget = isInjectedWidget()
  const connectors: CreateConnectorFn[] = []

  // Register the MetaMask SDK connector for desktop browsers so MetaMask is
  // always discoverable — even when the extension is not installed — via
  // deeplink or the MetaMask mobile QR code flow.
  if (!isSafeApp && !isWidget && !isMobile) {
    connectors.push(
      metaMask({
        dappMetadata: {
          name: 'CoW Swap',
          url: 'https://swap.cow.fi',
          iconUrl: 'https://swap.cow.fi/apple-touch-icon.png',
        },
      }),
    )
  }

  if (!isSafeApp && !isWidget && isMobile) {
    connectors.push(getBrowserInjectedConnector())
  }

  if (isSafeApp) {
    connectors.push(safe({ unstable_getInfoTimeout: 1000 }))
  }

  if (isWidget) {
    connectors.push(
      injected({
        target: {
          name: 'CoW Widget',
          id: COW_WIDGET_CONNECTOR_ID,
          provider: new WidgetEthereumProvider() as EIP1193Provider,
        },
        shimDisconnect: false,
      }),
    )
  }

  return connectors.length === 0 ? undefined : connectors
}

function getBrowserInjectedConnector(): CreateConnectorFn {
  return injected({
    target: {
      id: 'injected',
      name: 'Injected',
      // Keep the mobile-only generic injected connector behind the same
      // tab-isolation wrapper as EIP-6963 providers. Without this, its
      // accountsChanged / wallet_revokePermissions calls bypass isolation.
      provider: (targetWindow) => {
        const provider = getInjectedProvider(targetWindow)
        return provider ? createIsolatedProvider(provider) : undefined
      },
    },
    // wagmi's injected shimDisconnect path calls wallet_requestPermissions.
    // MetaMask iOS can leave that request pending forever, so mobile injected
    // must use the wallet's eth_requestAccounts flow instead.
    shimDisconnect: false,
  })
}
