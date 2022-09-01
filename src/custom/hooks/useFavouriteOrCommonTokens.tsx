import { useMemo } from 'react'
import { COMMON_BASES } from 'constants/routing'
import { useWeb3React } from '@web3-react/core'
import { useFavouriteTokens } from 'state/user/hooks'

export function useFavouriteOrCommonTokens() {
  const { chainId } = useWeb3React()

  const favouriteTokens = useFavouriteTokens()

  return useMemo(() => {
    const bases = typeof chainId !== 'undefined' ? COMMON_BASES[chainId] ?? [] : []
    return favouriteTokens.length > 0 ? favouriteTokens : bases
  }, [chainId, favouriteTokens])
}
