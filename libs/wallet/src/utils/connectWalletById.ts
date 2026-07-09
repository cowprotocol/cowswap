import { StorageUtil } from '@reown/appkit-controllers'

import { wagmiAdapter } from '../wagmi/config'

import type { AdapterBlueprint } from '@reown/appkit-controllers'

export function connectWalletById(id: string, type: string): Promise<AdapterBlueprint.ConnectResult> {
  StorageUtil.removeDisconnectedConnectorId(id, 'eip155')
  return wagmiAdapter.connect({ id, type })
}
