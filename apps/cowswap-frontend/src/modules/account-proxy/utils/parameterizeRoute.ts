import { SupportedChainId } from '@cowprotocol/cow-sdk'

interface RouteParams {
  chainId: SupportedChainId
  proxyAddress?: string
  tokenAddress?: string
}

export function parameterizeRoute(route: string, { chainId, proxyAddress, tokenAddress }: RouteParams): string {
  return route
    .replace('/:chainId', chainId ? `/${encodeURIComponent(chainId)}` : '')
    .replace('/:proxyAddress', proxyAddress ? `/${encodeURIComponent(proxyAddress)}` : '')
    .replace('/:tokenAddress', tokenAddress ? `/${encodeURIComponent(tokenAddress)}` : '')
}
