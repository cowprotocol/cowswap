import type { EIP6963ProviderDetail } from '@cowprotocol/types'

import { EIP6963ProviderInfo, ProviderWcMetadata } from '../types'

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProviderWcMetadata(provider: any): ProviderWcMetadata | undefined {
  if (!provider.isWalletConnect) return

  return provider?.session?.peer?.metadata
}

export function getEip6963ProviderInfo(
  provider: unknown,
  eip6963Providers: EIP6963ProviderDetail[],
): EIP6963ProviderInfo | undefined {
  return eip6963Providers.find((p) => p.provider === provider)?.info
}
