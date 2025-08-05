import { SupportedChainId } from '@cowprotocol/cow-sdk'

interface RouteParams {
  chainId: SupportedChainId
  proxyAddress?: string
}

export function parameterizeRoute(route: string, { chainId, proxyAddress }: RouteParams): string {
  return route
    .replace('/:chainId', chainId ? `/${encodeURIComponent(chainId)}` : '')
    .replace('/:proxyAddress', proxyAddress ? `/${encodeURIComponent(proxyAddress)}` : '')
}
