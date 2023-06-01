import { Token } from '@uniswap/sdk-core'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function useWrappedToken(): Token {
  return useNativeCurrency().wrapped
}
