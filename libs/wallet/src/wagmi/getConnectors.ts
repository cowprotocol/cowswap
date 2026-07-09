import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { injected, safe } from '@wagmi/connectors'
import { EIP1193Provider } from 'viem'

import { getInjectedProvider } from '../api/utils/connection'
import { createIsolatedProvider } from '../providerIsolation'
import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'

import type { CreateConnectorFn } from 'wagmi'

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

export function getConnectors(): CreateConnectorFn[] | undefined {
  const isSafeApp = getIsSafeAppIframe()
  const isWidget = isInjectedWidget()
  const connectors: CreateConnectorFn[] = []

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
