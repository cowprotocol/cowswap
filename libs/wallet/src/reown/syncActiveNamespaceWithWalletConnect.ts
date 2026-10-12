import { logWallet, normalizeError } from '@cowprotocol/common-utils'

import { ChainController, ConnectorController } from '@reown/appkit-controllers'

import { WALLET_CONNECT_CONNECTOR_ID } from './consts'

import type { AppKit } from '@reown/appkit'
import type { ChainNamespace } from '@reown/appkit-common'

export type WalletConnectNamespaceAppKit = Pick<AppKit, 'getUniversalProvider' | 'getCaipNetwork' | 'switchNetwork'>

export function bindActiveNamespaceToWalletConnect(appKit: WalletConnectNamespaceAppKit): void {
  let isSyncing = false

  ChainController.subscribe(() => {
    if (isSyncing) return

    isSyncing = true

    syncActiveNamespaceWithWalletConnect(appKit)
      .catch((err: unknown) => {
        const error = normalizeError(err)
        logWallet.error(new Error('Failed to sync the active namespace with WalletConnect', { cause: error }))
      })
      .finally(() => {
        isSyncing = false
      })
  })
}

export async function syncActiveNamespaceWithWalletConnect(appKit: WalletConnectNamespaceAppKit): Promise<void> {
  const activeNamespace = ChainController.state.activeChain

  if (!activeNamespace || hasAccount(activeNamespace)) return

  const connectedNamespace = findOtherWalletConnectNamespace(activeNamespace)

  if (!connectedNamespace) return

  if (!(await isMissingFromSession(appKit, activeNamespace))) return
  if (ChainController.state.activeChain !== activeNamespace) return

  const network = appKit.getCaipNetwork(connectedNamespace)

  if (network) {
    await appKit.switchNetwork(network)
  }
}

function findOtherWalletConnectNamespace(activeNamespace: ChainNamespace): ChainNamespace | undefined {
  return [...ChainController.state.chains.keys()].find(
    (namespace) =>
      namespace !== activeNamespace &&
      ConnectorController.getConnectorId(namespace) === WALLET_CONNECT_CONNECTOR_ID &&
      hasAccount(namespace),
  )
}

function hasAccount(namespace: ChainNamespace): boolean {
  return Boolean(ChainController.getAccountData(namespace)?.address)
}

async function isMissingFromSession(appKit: WalletConnectNamespaceAppKit, namespace: ChainNamespace): Promise<boolean> {
  const sessionNamespaces = (await appKit.getUniversalProvider())?.session?.namespaces

  if (!sessionNamespaces) return false

  // AppKit syncs the session namespaces one by one, so an approved active namespace may not have its account yet
  return !sessionNamespaces[namespace]?.accounts.length
}
