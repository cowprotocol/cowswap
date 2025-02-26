import type { EIP6963ProviderDetail } from '@cowprotocol/types'

import { EIP6963ProviderInfo, ProviderWcMetadata } from '../types'

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
