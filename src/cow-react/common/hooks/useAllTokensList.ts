import { Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useAllTokens } from 'hooks/Tokens'

export function useAllTokensList(): Token[] {
  const allTokens = useAllTokens()

  return useMemo(() => Object.values(allTokens), [allTokens])
}
