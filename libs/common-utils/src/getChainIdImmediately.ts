import { JsonRpcProvider } from '@ethersproject/providers'

export async function getChainIdImmediately(provider: JsonRpcProvider): Promise<number | undefined> {
  try {
    const chainId = await provider.send('eth_chainId', [])

    return parseInt(chainId, 16)
  } catch (error) {
    console.error('Failed to get chainId from provider', error)
    return undefined
  }
}
