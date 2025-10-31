import { getChainIdImmediately } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider, Provider } from '@ethersproject/providers'

import { t } from '@lingui/core/macro'

export async function assertProviderNetwork(
  chainId: SupportedChainId,
  provider: JsonRpcProvider | Provider,
  description: string,
): Promise<SupportedChainId> {
  const ethereumProvider = (provider as unknown as { provider: typeof window.ethereum }).provider

  // Do assert only for Metamask
  if (!ethereumProvider || !ethereumProvider.isMetaMask || ethereumProvider.isRabby) return chainId

  const network = await getChainIdImmediately(provider)
  const networkString = network ? network.toString() : ''

  if (network !== chainId) {
    throw new Error(
      t`Wallet chainId differs from app chainId. Wallet: ${networkString}, App: ${chainId}. Action: ${description}`,
    )
  }

  return network
}
