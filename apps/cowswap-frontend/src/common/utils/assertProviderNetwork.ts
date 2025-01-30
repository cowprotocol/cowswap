import { getChainIdImmediately } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider, Provider } from '@ethersproject/providers'

export async function assertProviderNetwork(
  chainId: SupportedChainId,
  provider: JsonRpcProvider | Provider,
  description: string,
): Promise<SupportedChainId> {
  const ethereumProvider = (provider as unknown as { provider: typeof window.ethereum }).provider

  // Do assert only for Metamask
  if (!ethereumProvider || !ethereumProvider.isMetaMask || ethereumProvider.isRabby) return chainId

  const network = await getChainIdImmediately(provider)
  if (network !== chainId) {
    throw new Error(
      `Wallet chainId differs from app chainId. Wallet: ${network}, App: ${chainId}. Action: ${description}`,
    )
  }

  return network
}
