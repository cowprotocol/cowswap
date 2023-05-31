import { Token } from '@uniswap/sdk-core'

import { useNativeCurrency } from './useNativeCurrency'

export function useWrappedToken(): Token {
  return useNativeCurrency().wrapped
}
