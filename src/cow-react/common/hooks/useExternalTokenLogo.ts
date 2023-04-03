import { useProxyTokenLogo } from '@cow/api/proxy'
import { Currency } from '@uniswap/sdk-core'

export function useExternalTokenLogo(currency?: Currency | null): string | void {
  const logo = useProxyTokenLogo(currency?.chainId, currency?.isToken ? currency?.address : undefined)

  return logo
}
