import { useConnection } from 'wagmi'

import { useAvailableChains } from '@cowprotocol/common-hooks'

/**
 * Returns true when the connected wallet is on a chain not supported by the app.
 * Reads the raw provider chain via useConnection() instead of useWalletInfo(),
 * because useWalletInfo() masks unsupported chains with a URL fallback.
 */
export function useIsProviderNetworkUnsupported(): boolean {
  const { chainId, isConnected } = useConnection()
  const availableChains = useAvailableChains()

  if (!isConnected || !chainId) return false

  return !availableChains.includes(chainId)
}
