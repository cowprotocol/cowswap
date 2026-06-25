import { isInjectedWidget } from '@cowprotocol/common-utils'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { injected, safe } from '@wagmi/connectors'
import { EIP1193Provider, getAddress } from 'viem'

import { getInjectedProvider } from '../api/utils/connection'
import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'

import type { CreateConnectorFn } from 'wagmi'

/**
 * MetaMask iOS (and some other mobile in-app browsers) never resolve
 * `provider.request({ method: 'eth_accounts' })` until `eth_requestAccounts`
 * has run once in the session — the injected provider doesn't flush
 * `eth_accounts` before the connection handshake, so the promise hangs forever.
 *
 * `connector.getAccounts()` calls `eth_accounts` first thing, which means
 * `getConnectorClient` → `getWalletClient` → `useWalletClient` get stuck in a
 * permanent pending state on those wallets.
 *
 * `eth_requestAccounts` auto-approves inside the wallet's own browser and, when
 * already connected, resolves without a prompt — so we swap it in on mobile.
 * Desktop keeps the original `eth_accounts` behaviour to avoid reconnect prompts.
 */
function withMobileGetAccountsFix(connectorFn: CreateConnectorFn): CreateConnectorFn {
  return (config) => {
    const connector = connectorFn(config)

    return {
      ...connector,
      async getAccounts() {
        const provider = (await connector.getProvider()) as EIP1193Provider | undefined
        if (!provider) throw new Error('Provider not found')
        const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as readonly string[]
        return accounts.map((x) => getAddress(x))
      },
    }
  }
}

function getBrowserInjectedConnector(): CreateConnectorFn {
  return withMobileGetAccountsFix(
    injected({
      target: {
        id: 'injected',
        name: 'Injected',
        provider: getInjectedProvider,
      },
      // On mobile, `shimDisconnect: true` makes wagmi's `connect()` call
      // `wallet_requestPermissions`, which MetaMask iOS does not support and
      // hangs on (its `catch` only fires on reject, not on a stalled request).
      // Disabling the shim routes connect straight to `eth_requestAccounts`.
      shimDisconnect: false,
    }),
  )
}

export function getConnectors(): CreateConnectorFn[] | undefined {
  const isSafeApp = getIsSafeAppIframe()
  const isWidget = isInjectedWidget()
  const connectors: CreateConnectorFn[] = []

  if (!isSafeApp && !isWidget) {
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
