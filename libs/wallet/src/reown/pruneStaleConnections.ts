import { ChainController, ConnectionController, StorageUtil } from '@reown/appkit-controllers'

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
  for (const namespace of [...ChainController.state.chains.keys()]) {
    if (!isNamespaceWithoutAccount(namespace)) continue

    const connections = ConnectionController.getConnections(namespace)

    if (!connections.length) continue

    for (const { connectorId, accounts } of connections) {
      for (const { address } of accounts) {
        StorageUtil.deleteAddressFromConnection({ connectorId, address, namespace })
      }
    }

    ConnectionController.setConnections([], namespace)
  }
}

function isNamespaceWithoutAccount(namespace: ChainNamespace): boolean {
  const account = ChainController.getAccountData(namespace)

  if (account?.caipAddress) return false

  // A restore still in flight has no address yet, and its records must survive
  return account?.status !== 'connecting' && account?.status !== 'reconnecting'
}
