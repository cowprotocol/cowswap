import { Currency } from '@uniswap/sdk-core'

import { useProxyTokenLogo } from 'api/proxy'

export function useExternalTokenLogo(currency?: Currency | null): string | void {
  const logo = useProxyTokenLogo(currency?.chainId, currency?.isToken ? currency?.address : undefined)

  return logo
}
