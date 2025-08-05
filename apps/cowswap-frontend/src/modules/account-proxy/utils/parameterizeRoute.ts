import { SupportedChainId } from '@cowprotocol/cow-sdk'

interface RouteParams {
  chainId: SupportedChainId
}

export function parameterizeRoute(route: string, { chainId }: RouteParams): string {
  return route.replace('/:chainId', chainId ? `/${encodeURIComponent(chainId)}` : '')
}
