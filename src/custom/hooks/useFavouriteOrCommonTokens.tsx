import { useMemo } from 'react'
import { COMMON_BASES } from 'constants/routing'
import { useActiveWeb3React } from 'hooks/web3'
import { useFavouriteTokens } from 'state/user/hooks'

export function useFavouriteOrCommonTokens() {
  const { chainId } = useActiveWeb3React()

  const favouriteTokens = useFavouriteTokens()

  return useMemo(() => {
    const bases = typeof chainId !== 'undefined' ? COMMON_BASES[chainId] ?? [] : []
    return favouriteTokens.length > 0 ? favouriteTokens : bases
  }, [chainId, favouriteTokens])
}
