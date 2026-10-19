import { logWallet, normalizeError } from '@cowprotocol/common-utils'

import { ChainController, ConnectionController, ConnectorController, StorageUtil } from '@reown/appkit-controllers'

import type { ChainNamespace } from '@reown/appkit-common'

/**
 * Drops AppKit connection records for namespaces that ended up without an account.
 *
 * AppKit's connecting view refuses to connect a wallet that still has a connection record in its
 * namespace ("This account is already linked"), and the click becomes a no-op. The adapters re-add
 * those records on every boot from the persisted `@appkit/connections` key, while
 * `disconnectConnector()` skips the adapter disconnect — and therefore the record removal — as long
 * as the namespace has no address. A namespace whose restore did not produce an account is then
 * stuck: the wallet stays unselectable until a different one is connected.
 */
export function pruneStaleConnections(): void {
  // The modal is opened right after this call, so a failure here must never swallow the click
  try {
    for (const namespace of [...ChainController.state.chains.keys()]) {
      pruneNamespace(namespace)
    }
  } catch (err: unknown) {
    logWallet.error(new Error('Failed to prune stale AppKit connections', { cause: normalizeError(err) }))
  }
}

function isNamespaceWithoutAccount(namespace: ChainNamespace): boolean {
  const account = ChainController.getAccountData(namespace)

  if (account?.caipAddress) return false

  // A restore still in flight has no address yet, and its records must survive
  return account?.status !== 'connecting' && account?.status !== 'reconnecting'
}

function pruneNamespace(namespace: ChainNamespace): void {
  if (!isNamespaceWithoutAccount(namespace)) return

  const connections = ConnectionController.getConnections(namespace)

  if (!connections.length) return

  for (const { connectorId, accounts } of connections) {
    for (const { address } of accounts ?? []) {
      StorageUtil.deleteAddressFromConnection({ connectorId, address, namespace })
    }
  }

  ConnectionController.setConnections([], namespace)

  // The failed restore leaves the connector marked as active. AppKit's connecting view only closes
  // the modal when the active connector id changes, so reconnecting the very same wallet would
  // leave the user stuck on the connecting screen.
  ConnectorController.removeConnectorId(namespace)
}
