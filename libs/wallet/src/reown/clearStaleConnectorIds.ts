import { logWallet, normalizeError } from '@cowprotocol/common-utils'

import { ChainController, ConnectorController } from '@reown/appkit-controllers'

import type { ChainNamespace } from '@reown/appkit-common'

/**
 * Forgets the active connector of any namespace that ended up without an account.
 *
 * A restore that fails only sets the account status to `disconnected` — AppKit keeps the failed
 * wallet in `activeConnectorIds`. Its connecting view snapshots that id and closes the modal only
 * when the id *changes*, so reconnecting the very same wallet writes the identical id and leaves
 * the user on the connecting screen.
 */
export function clearStaleConnectorIds(): void {
  // The modal is opened right after this call, so a failure here must never swallow the click
  try {
    for (const namespace of [...ChainController.state.chains.keys()]) {
      if (hasStaleConnectorId(namespace)) {
        ConnectorController.removeConnectorId(namespace)
      }
    }
  } catch (err: unknown) {
    logWallet.error(new Error('Failed to clear stale AppKit connector ids', { cause: normalizeError(err) }))
  }
}

function hasStaleConnectorId(namespace: ChainNamespace): boolean {
  if (!ConnectorController.getConnectorId(namespace)) return false

  const account = ChainController.getAccountData(namespace)

  if (account?.caipAddress) return false

  // A restore still in flight has no address yet, and its connector id must survive
  return account?.status !== 'connecting' && account?.status !== 'reconnecting'
}
