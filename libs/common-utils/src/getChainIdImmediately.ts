import { JsonRpcProvider, Provider } from '@ethersproject/providers'

export async function getChainIdImmediately(provider: JsonRpcProvider | Provider): Promise<number | undefined> {
  if (!isJsonRpcProvider(provider)) {
    console.error('Provider is not a JsonRpcProvider')
    return undefined
  }

  try {
    const chainId = await provider.send('eth_chainId', [])

    return parseInt(chainId, 16)
  } catch (error) {
    console.error('Failed to get chainId from provider', error)
    return undefined
  }
}

function isJsonRpcProvider(provider: JsonRpcProvider | Provider): provider is JsonRpcProvider {
  return (provider as JsonRpcProvider).send !== undefined
}
