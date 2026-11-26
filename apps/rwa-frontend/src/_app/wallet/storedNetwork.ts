import { StorageUtil } from '@reown/appkit-controllers'

import type { AppKitNetwork } from '@reown/appkit/networks'

/**
 * AppKit keeps the active network under a fixed localStorage key, which this app shares with CoW Swap on the
 * swap.cow.fi origin. A CoW Swap network this app doesn't offer would open AppKit's "Switch Network" view instead of
 * the wallet list, so it is dropped before AppKit reads it.
 */
export function forgetUnsupportedStoredNetwork(networks: readonly AppKitNetwork[]): void {
  const storedCaipNetworkId = StorageUtil.getActiveCaipNetworkId()

  if (!storedCaipNetworkId) return

  const isSupported = networks.some((network) => `eip155:${network.id}` === storedCaipNetworkId)

  if (!isSupported) StorageUtil.deleteActiveCaipNetworkId()
}
